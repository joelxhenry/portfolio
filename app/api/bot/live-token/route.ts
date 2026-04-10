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

// Gemini Live model ID. The installed @google/genai@1.49.0 SDK's own
// docstring example references `gemini-live-2.5-flash-preview`, but as of
// late 2025 that preview name has been rotated out of Google's model
// registry — attempting to connect with it returns "models/... is not
// found for API version v1main, or is not supported for
// bidiGenerateContent" over the WebSocket.
//
// `gemini-2.0-flash-live-001` is the GA half-cascade Live model and is
// the most stable choice for a portfolio site (no preview-rotation risk).
// If you want the newer 2.5-era Live preview, candidates to try — all are
// still in preview and subject to the same rotation:
//   - gemini-2.5-flash-preview-native-audio-dialog
//   - gemini-2.5-flash-exp-native-audio-thinking-dialog
// Verify what's live on your key by running:
//   curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY" \
//     | jq '.models[] | select(.supportedGenerationMethods[]? == "bidiGenerateContent") | .name'
const MODEL = 'gemini-2.0-flash-live-001';
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
          model: MODEL,
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
        model: MODEL,
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
