import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// Phase 3 of .plans/bot.md — Text-to-Speech proxy. The browser POSTs a short
// chunk of assistant text to this route; the server calls Google Cloud TTS
// (Chirp3-HD voice) using a REST API key, caches the resulting MP3 keyed on
// sha256(voice + text), and returns a JSON response with the audio encoded
// as base64 — matching the JSON convention of the other routes in this
// codebase (see /api/contact and /api/bot/chat error payloads). Keeping the
// Google call server-side means the TTS key never ships to the client
// bundle, same as GEMINI_API_KEY for `/api/bot/chat`.

export const runtime = 'nodejs';

// Chirp3-HD voice roster published by Google Cloud TTS. "Charon" is a warm,
// mid-range male voice — matches the plan's "warm, confident, mid-range"
// requirement. Easy to swap later via the optional `voice` field on the
// request body.
const DEFAULT_VOICE = 'en-US-Chirp3-HD-Charon';
const DEFAULT_LANGUAGE_CODE = 'en-US';

const MAX_TEXT_CHARS = 5_000;
const CACHE_MAX_ENTRIES = 64;
const RATE_LIMIT_MAX = 60; // requests per IP per window (TTS fires per-sentence)
const RATE_LIMIT_WINDOW_MS = 60_000;

const TTS_ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize';

interface CacheEntry {
  // Base64-encoded MP3 — stored in this form because that's how Google Cloud
  // TTS returns it, and how this route returns it to the client. Avoids a
  // round-trip through Buffer on every cache hit.
  audioBase64: string;
  lastUsedAt: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Module-scoped LRU — bounded at CACHE_MAX_ENTRIES, evicts oldest lastUsedAt
// on overflow. Matches the phase plan note "cache responses by hash of
// (text + voice) in memory for repeat answers". Single-instance only; if the
// site ever runs behind multiple Node processes we'd move this to Redis.
const cache = new Map<string, CacheEntry>();
const rateLimitBuckets = new Map<string, RateLimitEntry>();

function isBotEnabled(): boolean {
  return process.env.NEXT_PUBLIC_BOT_ENABLED === 'true';
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

function hashKey(voice: string, text: string): string {
  return createHash('sha256').update(`${voice}\n${text}`).digest('hex');
}

function cacheGet(key: string): string | null {
  const entry = cache.get(key);
  if (!entry) return null;
  entry.lastUsedAt = Date.now();
  // Re-insert to bump LRU position.
  cache.delete(key);
  cache.set(key, entry);
  return entry.audioBase64;
}

function cachePut(key: string, audioBase64: string): void {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    // Map iteration order is insertion order — the first key is the LRU.
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { audioBase64, lastUsedAt: Date.now() });
}

interface SpeakRequestBody {
  text: string;
  voice: string;
}

function validateBody(raw: unknown): SpeakRequestBody | { error: string } {
  if (!raw || typeof raw !== 'object') {
    return { error: 'Request body must be an object' };
  }
  const text = (raw as { text?: unknown }).text;
  if (typeof text !== 'string' || text.trim().length === 0) {
    return { error: 'text must be a non-empty string' };
  }
  if (text.length > MAX_TEXT_CHARS) {
    return { error: `text must be ${MAX_TEXT_CHARS} characters or fewer` };
  }
  const voiceRaw = (raw as { voice?: unknown }).voice;
  const voice =
    typeof voiceRaw === 'string' && voiceRaw.length > 0
      ? voiceRaw
      : DEFAULT_VOICE;
  return { text, voice };
}

export async function POST(request: NextRequest) {
  if (!isBotEnabled()) {
    return NextResponse.json({ error: 'Bot is disabled' }, { status: 404 });
  }

  const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;
  if (!apiKey) {
    console.error('[bot/speak] GOOGLE_CLOUD_TTS_API_KEY is not set');
    return NextResponse.json(
      { error: 'TTS is not configured' },
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

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validated = validateBody(payload);
  if ('error' in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { text, voice } = validated;
  const key = hashKey(voice, text);

  const cached = cacheGet(key);
  if (cached) {
    return NextResponse.json(
      {
        audio: cached,
        encoding: 'base64',
        mimeType: 'audio/mpeg',
        voice,
        cache: 'HIT',
      },
      { headers: { 'cache-control': 'no-store' } },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(
      `${TTS_ENDPOINT}?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: DEFAULT_LANGUAGE_CODE, name: voice },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.0,
            pitch: 0,
          },
        }),
      },
    );
  } catch (error) {
    console.error('[bot/speak] TTS fetch failed:', error);
    return NextResponse.json(
      { error: 'TTS upstream request failed' },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    const errorBody = await upstream.text().catch(() => '');
    console.error(
      '[bot/speak] TTS non-OK response:',
      upstream.status,
      errorBody.slice(0, 512),
    );
    return NextResponse.json(
      { error: 'TTS upstream request failed' },
      { status: 502 },
    );
  }

  let json: { audioContent?: string };
  try {
    json = (await upstream.json()) as { audioContent?: string };
  } catch (error) {
    console.error('[bot/speak] failed to parse TTS JSON:', error);
    return NextResponse.json(
      { error: 'TTS upstream returned invalid response' },
      { status: 502 },
    );
  }

  if (!json.audioContent) {
    return NextResponse.json(
      { error: 'TTS upstream returned no audio' },
      { status: 502 },
    );
  }

  cachePut(key, json.audioContent);

  return NextResponse.json(
    {
      audio: json.audioContent,
      encoding: 'base64',
      mimeType: 'audio/mpeg',
      voice,
      cache: 'MISS',
    },
    { headers: { 'cache-control': 'no-store' } },
  );
}
