import { GoogleGenAI, Modality } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

import { buildSystemInstruction } from '@/app/lib/bot/prompt';

// Phase 4 of .plans/bot.md — mint a short-lived ephemeral auth token that
// the browser uses to open a direct WebSocket to Gemini Live.
//
// The plan's canonical suggestion was to "Add a WebSocket route (or use
// Next.js route with upgrade handling, or a small sidecar Node server) that
// proxies browser audio → Gemini Live → browser audio". Next 13 App Router
// has no built-in WebSocket upgrade story and adding a sidecar would balloon
// the deploy. The ephemeral-token path keeps the real GEMINI_API_KEY
// server-side while still letting the browser talk directly to Gemini for
// lowest-possible latency — the secret in the client's hands is a
// single-use, short-lived credential locked to a fixed model + system
// instruction + voice config, so a visitor poking at devtools cannot
// repurpose it.

export const runtime = 'nodejs';

// Gemini Live models rotate frequently — preview names get renamed or
// deprecated without warning, and which models are actually available
// depends on the specific GEMINI_API_KEY's project, tier, and region.
// Hardcoding a single name keeps breaking, so instead we dynamically
// query `models.list()` for models that report `bidiGenerateContent` in
// their `supportedGenerationMethods` and pick the best one per the
// preference order below.
//
// If you want to pin a specific model, set GEMINI_LIVE_MODEL in .env.
// Otherwise the route picks automatically.
//
// Preference order: GA half-cascade first (most stable) → 2.5-era
// previews → experimentals. The first match wins.
const MODEL_PREFERENCE_ORDER = [
  'gemini-2.0-flash-live-001',
  'gemini-live-2.5-flash-preview',
  'gemini-2.5-flash-preview-native-audio-dialog',
  'gemini-2.5-flash-exp-native-audio-thinking-dialog',
  'gemini-2.0-flash-exp',
];

// Module-scoped cache for the picked model. `models.list()` is a
// non-trivial HTTP call and the answer doesn't change turn-to-turn, so
// memoizing for the server process lifetime (or MODEL_CACHE_TTL_MS,
// whichever is shorter) is fine.
const MODEL_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
let cachedModelPick: { model: string; pickedAt: number } | null = null;
// Prebuilt Live voice — the SDK ships "Charon" as a warm, mid-range option.
// Chosen to match the Chirp3-HD pick in /api/bot/speak (Phase 3) so the bot
// sounds the same across both pipelines during the Phase 4 A/B.
const VOICE_NAME = 'Charon';
const LANGUAGE_CODE = 'en-US';

// How long the minted token stays valid for opening a new session.
const NEW_SESSION_WINDOW_MS = 2 * 60 * 1000; // 2 minutes
// How long the opened session itself may run before the server cuts it.
const SESSION_LIFETIME_MS = 15 * 60 * 1000; // 15 minutes

const RATE_LIMIT_MAX = 10; // tokens per IP per window
const RATE_LIMIT_WINDOW_MS = 60_000;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Module-scoped token bucket — same shape as /api/bot/chat and
// /api/bot/speak. Portfolio runs on a single instance; revisit if multi-box.
const rateLimitBuckets = new Map<string, RateLimitEntry>();

function isBotEnabled(): boolean {
  return process.env.NEXT_PUBLIC_BOT_ENABLED === 'true';
}

function isLiveModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_BOT_LIVE_MODE_ENABLED === 'true';
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]!.trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

function checkRateLimit(
  ip: string,
): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const existing = rateLimitBuckets.get(ip);

  if (!existing || existing.resetAt <= now) {
    rateLimitBuckets.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { ok: true };
  }

  if (existing.count >= RATE_LIMIT_MAX) {
    return {
      ok: false,
      retryAfter: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return { ok: true };
}

interface ModelListResponse {
  models?: Array<{
    name?: string;
    supportedGenerationMethods?: string[];
  }>;
}

/**
 * Query Google's models.list REST endpoint for the supplied API key and
 * pick the best Live-capable model according to MODEL_PREFERENCE_ORDER.
 * Returns null if the API call fails or no bidi-capable model is
 * available on this key. Cached for MODEL_CACHE_TTL_MS per server
 * process.
 */
async function pickBidiModel(apiKey: string): Promise<string | null> {
  // Env override wins — lets you pin a specific model without a deploy.
  const override = process.env.GEMINI_LIVE_MODEL;
  if (override && override.length > 0) {
    return override;
  }

  const now = Date.now();
  if (cachedModelPick && now - cachedModelPick.pickedAt < MODEL_CACHE_TTL_MS) {
    return cachedModelPick.model;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}&pageSize=200`,
      {
        method: 'GET',
        headers: { accept: 'application/json' },
      },
    );
    if (!response.ok) {
      console.error(
        '[bot/live-token] models.list returned',
        response.status,
        (await response.text().catch(() => '')).slice(0, 300),
      );
      return null;
    }
    const data = (await response.json()) as ModelListResponse;
    const bidiModels = (data.models ?? [])
      .filter((model) =>
        Array.isArray(model.supportedGenerationMethods) &&
        model.supportedGenerationMethods.includes('bidiGenerateContent'),
      )
      .map((model) => (model.name ?? '').replace(/^models\//, ''))
      .filter((name): name is string => name.length > 0);

    if (bidiModels.length === 0) {
      console.error(
        '[bot/live-token] no bidi-capable models available on this key',
      );
      return null;
    }

    // Log the discovered list once — priceless for diagnosing future
    // model rotations.
    console.info('[bot/live-token] available bidi models:', bidiModels);

    // Return the first preference that's available on this key.
    for (const preferred of MODEL_PREFERENCE_ORDER) {
      if (bidiModels.includes(preferred)) {
        cachedModelPick = { model: preferred, pickedAt: now };
        return preferred;
      }
    }
    // None of the preferred names matched — fall back to whatever the
    // key does have.
    const fallback = bidiModels[0]!;
    cachedModelPick = { model: fallback, pickedAt: now };
    return fallback;
  } catch (error) {
    console.error('[bot/live-token] models.list failed:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  // Two flags so Phase 3 can keep running with Phase 4 turned off (the
  // default). Either being missing returns 404 — same defence-in-depth
  // pattern as the other bot routes.
  if (!isBotEnabled() || !isLiveModeEnabled()) {
    return NextResponse.json(
      { error: 'Live voice mode is disabled' },
      { status: 404 },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[bot/live-token] GEMINI_API_KEY is not set');
    return NextResponse.json(
      { error: 'Bot is not configured' },
      { status: 503 },
    );
  }

  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: { 'retry-after': String(rateLimit.retryAfter) },
      },
    );
  }

  // Pick a bidi-capable model dynamically. If the account has no Live
  // API access at all, this returns null and we surface a clear error
  // instead of minting a token that's guaranteed to fail at connect
  // time.
  const pickedModel = await pickBidiModel(apiKey);
  if (!pickedModel) {
    return NextResponse.json(
      {
        error:
          'No Gemini Live model available on this API key. Confirm your project has the Live API enabled and that bidiGenerateContent is listed in models.list.',
      },
      { status: 503 },
    );
  }

  // Ephemeral auth tokens are v1alpha-only on the Gemini Developer API per
  // the SDK docs on `ai.tokens.create`.
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { apiVersion: 'v1alpha' },
  });

  const now = Date.now();
  try {
    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        newSessionExpireTime: new Date(
          now + NEW_SESSION_WINDOW_MS,
        ).toISOString(),
        expireTime: new Date(now + SESSION_LIFETIME_MS).toISOString(),
        liveConnectConstraints: {
          model: pickedModel,
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: buildSystemInstruction(),
            // Enable transcripts so the chat drawer can show what the
            // visitor said and what the bot replied, even though the
            // primary modality is audio.
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            speechConfig: {
              languageCode: LANGUAGE_CODE,
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: VOICE_NAME },
              },
            },
          },
        },
        // Lock exactly the fields set above. The browser can still override
        // unlocked knobs (e.g. abortSignal) but cannot swap the system
        // instruction or model.
        lockAdditionalFields: [],
      },
    });

    if (!token.name) {
      throw new Error('Token response missing name');
    }

    return NextResponse.json(
      {
        token: token.name,
        model: pickedModel,
        sessionExpiresAt: new Date(now + SESSION_LIFETIME_MS).toISOString(),
      },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    console.error('[bot/live-token] token creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to mint live session token' },
      { status: 502 },
    );
  }
}
