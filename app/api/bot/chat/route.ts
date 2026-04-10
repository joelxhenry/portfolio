import { GenerateContentResponse, GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

import { buildSystemInstruction } from '@/app/lib/bot/prompt';

// The /api/bot/chat route (Phase 2 of .plans/bot.md) — text-only chat that
// injects Joel's knowledge base as system instruction, calls Gemini, and
// streams the response back as plain text chunks the client can append
// directly to a message bubble.
//
// This route is gated by NEXT_PUBLIC_BOT_ENABLED. The same env var controls
// whether <BotLauncher /> renders at all; checking it here means a visitor
// who somehow reaches the endpoint with the flag off still gets a clean 404.

export const runtime = 'nodejs';

const MODEL = 'gemini-2.5-flash';
const MAX_TURNS = 20;
const MAX_USER_MESSAGE_CHARS = 2000;
const RATE_LIMIT_MAX = 15; // requests per IP per window
const RATE_LIMIT_WINDOW_MS = 60_000;

type ClientRole = 'user' | 'assistant';

interface ClientMessage {
  role: ClientRole;
  content: string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Module-scoped token bucket. Next.js keeps this alive across requests in the
// same server instance — fine for a single-box portfolio deploy. Revisit if
// the site ever runs behind multiple instances.
const rateLimitBuckets = new Map<string, RateLimitEntry>();

function isBotEnabled(): boolean {
  return process.env.NEXT_PUBLIC_BOT_ENABLED === 'true';
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list; the left-most value is
    // the original client.
    return forwarded.split(',')[0]!.trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

function checkRateLimit(ip: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const existing = rateLimitBuckets.get(ip);

  if (!existing || existing.resetAt <= now) {
    rateLimitBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true };
  }

  if (existing.count >= RATE_LIMIT_MAX) {
    return { ok: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { ok: true };
}

function validateMessages(raw: unknown): ClientMessage[] | { error: string } {
  if (!raw || typeof raw !== 'object' || !('messages' in raw)) {
    return { error: 'Request body must be { messages: [...] }' };
  }
  const messages = (raw as { messages: unknown }).messages;
  if (!Array.isArray(messages)) {
    return { error: 'messages must be an array' };
  }
  if (messages.length === 0) {
    return { error: 'messages cannot be empty' };
  }
  if (messages.length > MAX_TURNS) {
    return { error: `conversation exceeds ${MAX_TURNS}-turn limit` };
  }

  const validated: ClientMessage[] = [];
  for (const entry of messages) {
    if (!entry || typeof entry !== 'object') {
      return { error: 'each message must be an object' };
    }
    const role = (entry as { role?: unknown }).role;
    const content = (entry as { content?: unknown }).content;
    if (role !== 'user' && role !== 'assistant') {
      return { error: "each message role must be 'user' or 'assistant'" };
    }
    if (typeof content !== 'string') {
      return { error: 'each message content must be a string' };
    }
    if (role === 'user' && content.length > MAX_USER_MESSAGE_CHARS) {
      return {
        error: `user messages must be ${MAX_USER_MESSAGE_CHARS} characters or fewer`,
      };
    }
    validated.push({ role, content });
  }

  // Gemini expects the final turn to come from the user.
  if (validated[validated.length - 1]!.role !== 'user') {
    return { error: 'last message must be from the user' };
  }

  return validated;
}

export async function POST(request: NextRequest) {
  if (!isBotEnabled()) {
    return NextResponse.json({ error: 'Bot is disabled' }, { status: 404 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[bot/chat] GEMINI_API_KEY is not set');
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

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validated = validateMessages(payload);
  if ('error' in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const contents = validated.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const ai = new GoogleGenAI({ apiKey });

  let iterator: AsyncGenerator<GenerateContentResponse>;
  try {
    iterator = await ai.models.generateContentStream({
      model: MODEL,
      contents,
      config: {
        systemInstruction: buildSystemInstruction(),
        temperature: 0.7,
        maxOutputTokens: 512,
      },
    });
  } catch (error) {
    console.error('[bot/chat] Gemini request failed:', error);
    return NextResponse.json(
      { error: 'Upstream model request failed' },
      { status: 502 },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { value, done } = await iterator.next();
        if (done) {
          controller.close();
          return;
        }
        const text = value?.text;
        if (text) {
          controller.enqueue(encoder.encode(text));
        }
      } catch (error) {
        console.error('[bot/chat] stream error:', error);
        controller.error(error);
      }
    },
    async cancel() {
      // Best-effort drain so the SDK can clean up its upstream connection.
      try {
        await iterator.return?.(undefined);
      } catch {
        // ignored — cancellation should never throw
      }
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
      'x-accel-buffering': 'no',
    },
  });
}
