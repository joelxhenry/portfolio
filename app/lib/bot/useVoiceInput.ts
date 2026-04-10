import { useCallback, useEffect, useRef, useState } from 'react';

// Phase 3 of .plans/bot.md — a thin React wrapper around the browser's Web
// Speech API (window.SpeechRecognition / webkitSpeechRecognition). The API is
// not part of the default TypeScript DOM lib so we declare just the surface
// area the hook touches. Keep these interfaces minimal on purpose — the
// official draft spec is larger and mostly irrelevant here.
interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultLike {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionResultListLike {
  readonly length: number;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorEventLike extends Event {
  readonly error: string;
  readonly message?: string;
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

export interface UseVoiceInputOptions {
  /**
   * Fired once per `start()` cycle when the recognizer ends with a final
   * transcript. Receives the trimmed text. Not fired on empty / silent runs.
   */
  onFinalTranscript?: (transcript: string) => void;
  /** Fired the moment the user stops speaking / the recognizer ends. */
  onSpeechEnd?: () => void;
  lang?: string;
}

export interface UseVoiceInputResult {
  /** True if the current browser exposes a SpeechRecognition constructor. */
  supported: boolean;
  /** True between `onstart` and `onend` on the underlying recognizer. */
  listening: boolean;
  /** Rolling interim transcript — the live "what you're saying" preview. */
  interimTranscript: string;
  start: () => void;
  stop: () => void;
  /** Latest error string surfaced by the recognizer, if any. */
  error: string | null;
}

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

/**
 * React hook wrapping the Web Speech API for the bot drawer. Caller passes a
 * callback for final transcripts and gets back a boolean `listening` flag +
 * `start`/`stop` controls. On unsupported browsers (current Safari, most
 * mobile WebViews) `supported` is false and calling `start()` is a no-op so
 * the consumer can render a fallback hint without branching its JSX.
 */
export function useVoiceInput(
  options: UseVoiceInputOptions = {},
): UseVoiceInputResult {
  const { onFinalTranscript, onSpeechEnd, lang = 'en-US' } = options;

  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = useRef('');

  // Keep the latest callbacks in refs so the recognition setup effect can
  // depend only on `lang` — we don't want to tear down and rebuild the
  // recognizer every time the parent re-renders with a new closure.
  const onFinalTranscriptRef = useRef(onFinalTranscript);
  const onSpeechEndRef = useRef(onSpeechEnd);

  useEffect(() => {
    onFinalTranscriptRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  useEffect(() => {
    onSpeechEndRef.current = onSpeechEnd;
  }, [onSpeechEnd]);

  useEffect(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const recognition = new Ctor();
    recognition.lang = lang;
    // `continuous = false` asks the recognizer to end automatically on the
    // first pause — matches a push-to-talk UX where the visitor speaks one
    // question at a time.
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setError(null);
      setListening(true);
    };

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]!;
        const alternative = result[0];
        if (!alternative) continue;
        if (result.isFinal) {
          finalTranscriptRef.current += alternative.transcript;
        } else {
          interim += alternative.transcript;
        }
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      // "no-speech" and "aborted" fire in normal usage (silence / manual
      // cancel) — don't surface those as user-visible errors.
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setError(event.error || 'Voice input failed');
      }
      setListening(false);
    };

    recognition.onend = () => {
      const final = finalTranscriptRef.current.trim();
      finalTranscriptRef.current = '';
      setInterimTranscript('');
      setListening(false);
      onSpeechEndRef.current?.();
      if (final) {
        onFinalTranscriptRef.current?.(final);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch {
        // Aborting a never-started recognizer throws on some engines — ignore.
      }
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognitionRef.current = null;
    };
  }, [lang]);

  const start = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    finalTranscriptRef.current = '';
    setInterimTranscript('');
    setError(null);
    try {
      recognition.start();
    } catch {
      // Calling start() while the recognizer is already running throws an
      // InvalidStateError — safe to swallow for a press-to-talk button.
    }
  }, []);

  const stop = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.stop();
    } catch {
      // Same rationale as start() — stopping an already-stopped recognizer
      // throws; we treat stop() as idempotent from the caller's point of view.
    }
  }, []);

  return { supported, listening, interimTranscript, start, stop, error };
}
