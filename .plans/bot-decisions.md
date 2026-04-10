# Voice Box — Phase 0 Decisions

Companion doc to [.plans/bot.md](./bot.md). Captures the "decide on paper" outputs of Phase 0 so later phases have a clear reference.

## Voice pipeline: **Option B** for phase 1→3

We will ship the Phase 1–3 MVP on **Option B**: browser Web Speech API for STT + Gemini text generation + Google Cloud TTS for speech out.

### Why Option B (not Live API) first

- **Ship faster.** No WebSocket infra, no server-side audio buffering, no session state to manage. Fits Next.js route handlers cleanly.
- **Zero-cost STT in the common case.** Web Speech API is free in Chrome/Edge; Gemini spend stays proportional to text tokens only.
- **Incremental risk.** We can prove grounding + persona + UI feel *without* also fighting audio latency bugs. If the text layer is bad, no amount of low-latency audio fixes it.
- **Graceful degradation story is obvious.** Safari/Firefox users who lack Web Speech can still type — the bot is never bricked.

### Known trade-offs we accept

- **No barge-in.** Visitors cannot interrupt the bot mid-answer. Mitigation: keep answers tight (~60–90s / 150–220 words — enforced in the system prompt).
- **Higher perceived latency.** Stitching STT → LLM → TTS adds handoffs. Mitigation: stream Gemini text tokens to the UI immediately, and start TTS on the first complete sentence rather than waiting for the whole answer.
- **Browser support gaps.** Web Speech is uneven outside Chromium. Mitigation: detect and fall back to text input with a one-line explainer.

### When to revisit (Phase 4 trigger)

Upgrade to Gemini Live API if, after Phase 3 ships, any of these hold:
- End-to-end latency (user stops speaking → first audio byte) consistently > 2s in real use.
- Users regularly try to interrupt the bot.
- Analytics show conversations dropping off mid-answer.

## Guardrails

See [bot-guardrails.md](./bot-guardrails.md) for the full "what the bot will not say" list.
