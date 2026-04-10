import { useCallback, useEffect, useRef, useState } from 'react';

// Phase 3 of .plans/bot.md — the playback side of the voice pipeline.
//
// The chat route streams the assistant's reply as plain text chunks. To hit
// the "< 2s from user-finished-speaking to first audio byte" target we can't
// wait for the full answer to arrive before synthesising speech. Instead we
// feed incoming text into `enqueue(textSoFar)` on every stream tick; the hook
// extracts any newly-completed sentences, POSTs each one to `/api/bot/speak`,
// and plays the returned MP3s back-to-back via a single HTMLAudioElement.
//
// Design notes:
// - Sentence boundaries are detected on `[.!?]` followed by whitespace or end.
//   This correctly skips decimal points like "3.5 years" because there's no
//   whitespace after the dot.
// - We track a `spokenUpTo` cursor into the cumulative text so each enqueue()
//   call only considers the delta. `flush()` is for the trailing remainder
//   that may not have a terminal punctuation mark — call it once the stream
//   has ended.
// - Playback is strictly sequential. The queue holds pending synthesis jobs;
//   when one finishes the next one starts. Stopping aborts in-flight fetches
//   and clears the queue.
// - `onFirstAudioByte` fires exactly once per `reset()` lifecycle — the
//   consumer uses it to measure STT-to-first-audio latency.

export interface UseVoicePlaybackOptions {
  muted?: boolean;
  onFirstAudioByte?: () => void;
}

export interface UseVoicePlaybackResult {
  /** True while any audio is playing (or a synthesis job is outstanding). */
  speaking: boolean;
  /**
   * Called whenever the cumulative assistant text grows. The hook extracts
   * any newly-completed sentences and queues them for TTS. Safe to call on
   * every stream chunk.
   */
  enqueue: (cumulativeText: string) => void;
  /**
   * Speaks any trailing remainder after the last sentence boundary. Call
   * exactly once when the chat stream has fully ended.
   */
  flush: () => void;
  /** Aborts in-flight synthesis + playback and clears the queue. */
  stop: () => void;
  /** Resets cursors/state so the next assistant turn starts clean. */
  reset: () => void;
  error: string | null;
}

function findLastSentenceBoundary(text: string): number {
  // Returns the index of the last sentence-ending punctuation followed by a
  // whitespace character (or end of string). -1 if no boundary found.
  const re = /[.!?](?=\s|$)/g;
  let last = -1;
  let match: RegExpExecArray | null;
  // eslint-disable-next-line no-cond-assign
  while ((match = re.exec(text)) !== null) {
    last = match.index;
  }
  return last;
}

/**
 * Decode a base64 string into a typed-array Blob with the given MIME type.
 * Used to turn the JSON payload from `/api/bot/speak` into something we can
 * hand to `<audio>.src` via `URL.createObjectURL`.
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

interface SpeakResponseBody {
  audio: string;
  encoding: 'base64';
  mimeType: string;
}

export function useVoicePlayback(
  options: UseVoicePlaybackOptions = {},
): UseVoicePlaybackResult {
  const { muted = false, onFirstAudioByte } = options;

  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queueRef = useRef<Array<{ text: string; controller: AbortController }>>(
    [],
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(false);
  const mutedRef = useRef(muted);
  const spokenUpToRef = useRef(0);
  const lastCumulativeRef = useRef('');
  const firstByteFiredRef = useRef(false);
  const onFirstAudioByteRef = useRef(onFirstAudioByte);

  useEffect(() => {
    onFirstAudioByteRef.current = onFirstAudioByte;
  }, [onFirstAudioByte]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const stop = useCallback(() => {
    for (const entry of queueRef.current) {
      entry.controller.abort();
    }
    queueRef.current = [];
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    playingRef.current = false;
    setSpeaking(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    spokenUpToRef.current = 0;
    lastCumulativeRef.current = '';
    firstByteFiredRef.current = false;
    setError(null);
  }, [stop]);

  // Tear down on unmount so we don't leak a lingering audio element or an
  // in-flight fetch if the drawer closes mid-playback.
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  // When the user mutes mid-stream, stop immediately. Subsequent enqueue()
  // calls short-circuit via the mutedRef guard.
  useEffect(() => {
    if (muted) stop();
  }, [muted, stop]);

  const playNext = useCallback(() => {
    if (playingRef.current) return;
    const next = queueRef.current[0];
    if (!next) {
      setSpeaking(false);
      return;
    }
    if (mutedRef.current) {
      queueRef.current.shift();
      playNext();
      return;
    }
    playingRef.current = true;
    setSpeaking(true);

    const run = async () => {
      try {
        const response = await fetch('/api/bot/speak', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ text: next.text }),
          signal: next.controller.signal,
        });
        if (!response.ok) {
          throw new Error(`TTS request failed (${response.status})`);
        }
        const payload = (await response.json()) as SpeakResponseBody;
        if (!payload?.audio || payload.encoding !== 'base64') {
          throw new Error('TTS response missing audio payload');
        }
        const blob = base64ToBlob(
          payload.audio,
          payload.mimeType || 'audio/mpeg',
        );

        // Fire the latency probe as soon as the first chunk's bytes have
        // landed — this is when the visitor could begin hearing audio.
        if (!firstByteFiredRef.current) {
          firstByteFiredRef.current = true;
          onFirstAudioByteRef.current?.();
        }

        if (mutedRef.current || next.controller.signal.aborted) return;

        const url = URL.createObjectURL(blob);
        let audio = audioRef.current;
        if (!audio) {
          audio = new Audio();
          audio.preload = 'auto';
          audioRef.current = audio;
        }
        audio.src = url;

        await new Promise<void>((resolve, reject) => {
          const handleEnded = () => {
            cleanup();
            resolve();
          };
          const handleError = () => {
            cleanup();
            reject(new Error('Audio playback failed'));
          };
          const cleanup = () => {
            audio!.removeEventListener('ended', handleEnded);
            audio!.removeEventListener('error', handleError);
            URL.revokeObjectURL(url);
          };
          audio!.addEventListener('ended', handleEnded);
          audio!.addEventListener('error', handleError);
          audio!.play().catch((err: unknown) => {
            cleanup();
            reject(
              err instanceof Error ? err : new Error('Audio playback failed'),
            );
          });
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError((err as Error).message);
        }
      } finally {
        queueRef.current.shift();
        playingRef.current = false;
        if (queueRef.current.length > 0) {
          playNext();
        } else {
          setSpeaking(false);
        }
      }
    };

    void run();
  }, []);

  const pushChunk = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      if (mutedRef.current) return;
      queueRef.current.push({
        text: trimmed,
        controller: new AbortController(),
      });
      playNext();
    },
    [playNext],
  );

  const enqueue = useCallback(
    (cumulativeText: string) => {
      lastCumulativeRef.current = cumulativeText;
      if (mutedRef.current) return;
      const unspoken = cumulativeText.slice(spokenUpToRef.current);
      const boundary = findLastSentenceBoundary(unspoken);
      if (boundary === -1) return;
      const chunk = unspoken.slice(0, boundary + 1);
      spokenUpToRef.current += chunk.length;
      pushChunk(chunk);
    },
    [pushChunk],
  );

  const flush = useCallback(() => {
    if (mutedRef.current) return;
    const cumulative = lastCumulativeRef.current;
    const unspoken = cumulative.slice(spokenUpToRef.current).trim();
    if (!unspoken) return;
    spokenUpToRef.current = cumulative.length;
    pushChunk(unspoken);
  }, [pushChunk]);

  return {
    speaking,
    enqueue,
    flush,
    stop,
    reset,
    error,
  };
}
