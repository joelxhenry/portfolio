'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { LiveServerMessage, Session } from '@google/genai';

// Phase 4 of .plans/bot.md — Gemini Live bidirectional voice hook.
//
// Replaces the Phase 3 stitched pipeline (Web Speech STT → /api/bot/chat →
// /api/bot/speak TTS) with a single Gemini Live session. The browser opens
// the session directly against Gemini using an ephemeral token minted by
// /api/bot/live-token, so the real GEMINI_API_KEY never ships to the
// client.
//
// Audio plumbing:
//   mic → AudioContext(16 kHz) → AudioWorklet (Float32 → Int16 PCM) →
//     session.sendRealtimeInput({ audio }) → Gemini → LiveServerMessage →
//       base64 PCM @ 24 kHz → AudioBufferSourceNode → speakers
//
// Barge-in is native: Gemini runs server-side VAD. When the visitor starts
// talking mid-answer, the server sends `serverContent.interrupted = true`
// and we drop every queued output buffer so the bot shuts up immediately.
// No client-side VAD required.

export type LiveVoiceStatus = 'idle' | 'connecting' | 'listening' | 'error';

export interface UseLiveVoiceOptions {
  /** Fired when the visitor's turn finishes with a non-empty transcript. */
  onUserTranscript?: (text: string) => void;
  /** Fired with each incremental delta of the bot's own transcript. */
  onBotTranscriptDelta?: (delta: string) => void;
  /** Fired once per turn when the server marks the reply complete. */
  onTurnComplete?: () => void;
  /** Fired when the server signals the bot was interrupted (barge-in). */
  onInterrupted?: () => void;
  /** When true, incoming audio is dropped instead of scheduled for playback. */
  muted?: boolean;
}

export interface UseLiveVoiceResult {
  status: LiveVoiceStatus;
  error: string | null;
  /** True while there are scheduled output buffers actively playing. */
  speaking: boolean;
  start: () => Promise<void>;
  stop: () => void;
}

const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;
const WORKLET_URL = '/bot-pcm-processor.js';

function base64ToInt16(base64: string): Int16Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  // Gemini streams little-endian PCM; all browser JS engines use
  // little-endian typed arrays, so a direct view is safe.
  return new Int16Array(
    bytes.buffer,
    bytes.byteOffset,
    Math.floor(bytes.byteLength / 2),
  );
}

function int16ToFloat32(int16: Int16Array): Float32Array {
  const out = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i += 1) {
    out[i] = int16[i]! / 0x8000;
  }
  return out;
}

function bytesToBase64(bytes: Uint8Array): string {
  // `btoa(String.fromCharCode(...bytes))` blows the argument stack on big
  // arrays. Chunk through fromCharCode.apply instead.
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

export function useLiveVoice(
  options: UseLiveVoiceOptions = {},
): UseLiveVoiceResult {
  const [status, setStatus] = useState<LiveVoiceStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);

  const sessionRef = useRef<Session | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const silentGainRef = useRef<GainNode | null>(null);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextPlaybackTimeRef = useRef<number>(0);

  const mutedRef = useRef(options.muted ?? false);

  // Keep callbacks in refs so re-rendering the consumer doesn't rebuild the
  // `start` closure or the worklet port handler.
  const onUserTranscriptRef = useRef(options.onUserTranscript);
  const onBotTranscriptDeltaRef = useRef(options.onBotTranscriptDelta);
  const onTurnCompleteRef = useRef(options.onTurnComplete);
  const onInterruptedRef = useRef(options.onInterrupted);

  useEffect(() => {
    onUserTranscriptRef.current = options.onUserTranscript;
  }, [options.onUserTranscript]);
  useEffect(() => {
    onBotTranscriptDeltaRef.current = options.onBotTranscriptDelta;
  }, [options.onBotTranscriptDelta]);
  useEffect(() => {
    onTurnCompleteRef.current = options.onTurnComplete;
  }, [options.onTurnComplete]);
  useEffect(() => {
    onInterruptedRef.current = options.onInterrupted;
  }, [options.onInterrupted]);

  const userTranscriptBufferRef = useRef('');
  // Tracks whether we've already flushed the user transcript for the
  // *current* turn. Lets us fire the user-bubble callback the moment the
  // bot starts replying, regardless of whether Gemini marks the input
  // transcription as `finished` before or after the first output byte.
  const userTranscriptFlushedRef = useRef(false);

  const flushUserTranscript = useCallback(() => {
    if (userTranscriptFlushedRef.current) return;
    const text = userTranscriptBufferRef.current.trim();
    userTranscriptBufferRef.current = '';
    userTranscriptFlushedRef.current = true;
    if (text) {
      onUserTranscriptRef.current?.(text);
    }
  }, []);

  const stopPlayback = useCallback(() => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch {
        // Safari throws if the source has already ended — ignore.
      }
    });
    activeSourcesRef.current.clear();
    nextPlaybackTimeRef.current = 0;
    setSpeaking(false);
  }, []);

  // React to mute toggles mid-conversation: kill any queued audio so the
  // visitor isn't ambushed after un-muting.
  useEffect(() => {
    mutedRef.current = options.muted ?? false;
    if (mutedRef.current) {
      stopPlayback();
    }
  }, [options.muted, stopPlayback]);

  const schedulePcm = useCallback((int16: Int16Array) => {
    if (mutedRef.current) return;
    const ctx = outputCtxRef.current;
    if (!ctx) return;
    const float32 = int16ToFloat32(int16);
    // AudioBuffer.sampleRate is independent of the context rate — the
    // browser resamples 24 kHz → ctx.sampleRate automatically on playback.
    const buffer = ctx.createBuffer(1, float32.length, OUTPUT_SAMPLE_RATE);
    buffer.copyToChannel(float32, 0);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    const now = ctx.currentTime;
    const startAt = Math.max(nextPlaybackTimeRef.current, now);
    source.start(startAt);
    nextPlaybackTimeRef.current = startAt + buffer.duration;
    activeSourcesRef.current.add(source);
    setSpeaking(true);
    source.onended = () => {
      activeSourcesRef.current.delete(source);
      if (activeSourcesRef.current.size === 0) {
        setSpeaking(false);
      }
    };
  }, []);

  const teardown = useCallback(() => {
    stopPlayback();

    try {
      sessionRef.current?.close();
    } catch {
      // Closing an already-closed session throws on some SDK builds.
    }
    sessionRef.current = null;

    try {
      workletNodeRef.current?.disconnect();
    } catch {
      // noop
    }
    workletNodeRef.current = null;
    try {
      sourceNodeRef.current?.disconnect();
    } catch {
      // noop
    }
    sourceNodeRef.current = null;
    try {
      silentGainRef.current?.disconnect();
    } catch {
      // noop
    }
    silentGainRef.current = null;

    const stream = mediaStreamRef.current;
    if (stream) {
      for (const track of stream.getTracks()) {
        try {
          track.stop();
        } catch {
          // noop
        }
      }
    }
    mediaStreamRef.current = null;

    const inputCtx = inputCtxRef.current;
    if (inputCtx && inputCtx.state !== 'closed') {
      inputCtx.close().catch(() => {
        // Closing a context that's mid-suspend throws in some browsers.
      });
    }
    inputCtxRef.current = null;

    const outputCtx = outputCtxRef.current;
    if (outputCtx && outputCtx.state !== 'closed') {
      outputCtx.close().catch(() => {
        // same rationale as above
      });
    }
    outputCtxRef.current = null;

    userTranscriptBufferRef.current = '';
    userTranscriptFlushedRef.current = false;
  }, [stopPlayback]);

  // Cleanup on unmount — if the drawer unmounts mid-session we must release
  // the mic and close the WebSocket so we don't leak the connection.
  useEffect(() => {
    return () => {
      teardown();
    };
  }, [teardown]);

  const handleServerMessage = useCallback(
    (message: LiveServerMessage) => {
      const content = message.serverContent;
      if (!content) return;

      if (content.interrupted) {
        stopPlayback();
        onInterruptedRef.current?.();
      }

      if (content.inputTranscription?.text) {
        userTranscriptBufferRef.current += content.inputTranscription.text;
      }
      if (content.inputTranscription?.finished) {
        flushUserTranscript();
      }

      if (content.outputTranscription?.text) {
        // Any bot output means the visitor's turn is over — flush the user
        // transcript now so the chat shows the user bubble *before* the
        // bot's reply.
        flushUserTranscript();
        onBotTranscriptDeltaRef.current?.(content.outputTranscription.text);
      }

      const parts = content.modelTurn?.parts;
      if (parts) {
        for (const part of parts) {
          const inline = part.inlineData;
          if (!inline?.data) continue;
          // First audio byte is also a good "user is done speaking" signal.
          flushUserTranscript();
          // Gemini Live always streams 16-bit little-endian PCM at 24 kHz
          // (mimeType "audio/pcm;rate=24000"). We assume this invariant and
          // decode directly.
          const int16 = base64ToInt16(inline.data);
          schedulePcm(int16);
        }
      }

      if (content.turnComplete) {
        // Belt-and-braces: if the turn completed with only a transcript and
        // no audio/output text, make sure the user bubble still fires.
        flushUserTranscript();
        userTranscriptFlushedRef.current = false;
        onTurnCompleteRef.current?.();
      }
    },
    [schedulePcm, stopPlayback, flushUserTranscript],
  );

  const start = useCallback(async () => {
    if (status === 'connecting' || status === 'listening') return;
    setError(null);
    setStatus('connecting');

    try {
      // 0. Secure-context guard. `navigator.mediaDevices` is only exposed
      //    on HTTPS origins (or `localhost` / `127.0.0.1`). Loading the dev
      //    server via a LAN IP over plain http — a common mistake when
      //    testing on a phone — leaves `mediaDevices` undefined, which
      //    otherwise surfaces as a cryptic "Cannot read properties of
      //    undefined (reading 'getUserMedia')". Fail fast with something a
      //    human can act on instead.
      if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
        throw new Error(
          typeof window !== 'undefined' && window.isSecureContext === false
            ? 'Live voice requires HTTPS (or localhost). Open the site over https:// or at http://localhost:3000.'
            : 'This browser does not expose microphone access.',
        );
      }

      // 1. Mint an ephemeral token from the server route. The key stays
      //    server-side; the browser only holds a short-lived credential.
      const tokenRes = await fetch('/api/bot/live-token', { method: 'POST' });
      if (!tokenRes.ok) {
        const payload = await tokenRes.json().catch(() => ({
          error: `Token request failed (${tokenRes.status})`,
        }));
        throw new Error(
          payload.error ?? `Token request failed (${tokenRes.status})`,
        );
      }
      const { token, model } = (await tokenRes.json()) as {
        token: string;
        model: string;
      };

      // 2. Lazy import the SDK — keeps it out of the initial bundle for
      //    visitors who never open the bot, and out of any SSR path.
      const { GoogleGenAI, Modality } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey: token,
        httpOptions: { apiVersion: 'v1alpha' },
      });

      // 3. Ask for the mic. This throws on permission denial — the catch
      //    below surfaces it as a user-visible error.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // 4. Input AudioContext pinned to 16 kHz — the browser resamples the
      //    mic's native rate for us. Much simpler than resampling in the
      //    worklet by hand.
      const inputCtx = new AudioContext({ sampleRate: INPUT_SAMPLE_RATE });
      inputCtxRef.current = inputCtx;
      await inputCtx.audioWorklet.addModule(WORKLET_URL);

      // 5. Output AudioContext at the default rate. AudioBuffer.sampleRate
      //    is independent, so we create 24 kHz buffers and the browser
      //    handles the resample.
      const outputCtx = new AudioContext();
      outputCtxRef.current = outputCtx;
      if (outputCtx.state === 'suspended') {
        // `start()` is called from a user gesture (mic button click), so
        // resume() is allowed.
        outputCtx.resume().catch(() => {
          // Resume failures are non-fatal — we'll just miss the first
          // frames until the browser picks it up.
        });
      }

      // 6. Wire the mic through the worklet. We connect the worklet to a
      //    silent gain → destination so process() keeps firing in all
      //    browsers (some engines gate worklet execution on there being a
      //    downstream audio path).
      const workletNode = new AudioWorkletNode(inputCtx, 'bot-pcm-processor');
      workletNodeRef.current = workletNode;
      const sourceNode = inputCtx.createMediaStreamSource(stream);
      sourceNodeRef.current = sourceNode;
      const silentGain = inputCtx.createGain();
      silentGain.gain.value = 0;
      silentGainRef.current = silentGain;
      sourceNode.connect(workletNode);
      workletNode.connect(silentGain).connect(inputCtx.destination);

      // 7. Open the Live session. The ephemeral token already pins the
      //    model, system instruction, voice, and transcription config; the
      //    config below is effectively a no-op but the SDK requires it.
      const session = await ai.live.connect({
        model,
        callbacks: {
          onopen: () => {
            setStatus('listening');
          },
          onmessage: (msg) => {
            handleServerMessage(msg);
          },
          onerror: (err) => {
            // eslint-disable-next-line no-console
            console.error('[useLiveVoice] session error', err);
            // `err` is an ErrorEvent (WebSocket style), not an Error.
            // Pull a best-effort message out without asserting the type.
            const rawMessage =
              (err as { message?: unknown })?.message;
            const message =
              typeof rawMessage === 'string' && rawMessage.length > 0
                ? rawMessage
                : 'Live session error';
            setError(message);
            setStatus('error');
            teardown();
          },
          onclose: () => {
            // Normal close (`session.close()` or server-initiated end)
            // lands here. Preserve an existing `error` state so the user
            // sees the actual cause.
            setStatus((prev) => (prev === 'error' ? 'error' : 'idle'));
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
        },
      });
      sessionRef.current = session;

      // 8. Start streaming mic chunks upstream. The worklet posts Int16
      //    ArrayBuffers; we base64-encode and ship them as realtime input.
      workletNode.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
        const activeSession = sessionRef.current;
        if (!activeSession) return;
        const bytes = new Uint8Array(event.data);
        const base64 = bytesToBase64(bytes);
        try {
          activeSession.sendRealtimeInput({
            audio: {
              data: base64,
              mimeType: `audio/pcm;rate=${INPUT_SAMPLE_RATE}`,
            },
          });
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[useLiveVoice] sendRealtimeInput failed', err);
        }
      };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[useLiveVoice] start failed', err);
      setError(err instanceof Error ? err.message : 'Failed to start live voice');
      setStatus('error');
      teardown();
    }
  }, [status, handleServerMessage, teardown]);

  const stop = useCallback(() => {
    teardown();
    setStatus('idle');
  }, [teardown]);

  return { status, error, speaking, start, stop };
}
