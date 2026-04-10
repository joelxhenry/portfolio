// Phase 4 of .plans/bot.md — AudioWorklet processor that chunks microphone
// Float32 samples into 16-bit little-endian PCM for Gemini Live.
//
// The main thread creates an AudioContext at 16 kHz so the browser handles
// resampling from the mic's native rate. This processor just accumulates
// Float32 samples, converts to Int16, and posts fixed-size chunks back
// through its port. Off the main thread by design — the chat UI needs to
// stay responsive while the session streams audio upstream.

const CHUNK_SAMPLES = 2048; // ~128 ms at 16 kHz

class BotPcmProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(CHUNK_SAMPLES);
    this.offset = 0;
  }

  process(inputs) {
    const channels = inputs[0];
    if (!channels || channels.length === 0) return true;
    const input = channels[0];
    if (!input || input.length === 0) return true;

    for (let i = 0; i < input.length; i += 1) {
      this.buffer[this.offset++] = input[i];
      if (this.offset >= CHUNK_SAMPLES) {
        const int16 = new Int16Array(CHUNK_SAMPLES);
        for (let j = 0; j < CHUNK_SAMPLES; j += 1) {
          const s = Math.max(-1, Math.min(1, this.buffer[j]));
          int16[j] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        // Transfer ownership of the underlying buffer to avoid a copy.
        this.port.postMessage(int16.buffer, [int16.buffer]);
        this.offset = 0;
      }
    }
    return true;
  }
}

registerProcessor('bot-pcm-processor', BotPcmProcessor);
