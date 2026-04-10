import {
  Box,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  IconButton,
  Text,
  Textarea,
  Tooltip,
  VStack,
  keyframes,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BsBroadcast,
  BsChatDots,
  BsMicFill,
  BsMicMuteFill,
  BsSend,
  BsStars,
  BsStopFill,
  BsVolumeMuteFill,
  BsVolumeUpFill,
} from "react-icons/bs";
import { FaUser } from "react-icons/fa";

import ColorScheme from "../assets/colors";
import FontScheme from "../assets/fonts";
import { useLiveVoice } from "../lib/bot/useLiveVoice";
import { useVoiceInput } from "../lib/bot/useVoiceInput";
import { useVoicePlayback } from "../lib/bot/useVoicePlayback";

// Phase 2 of .plans/bot.md — a floating "Ask AI" button that opens a Chakra
// Drawer hosting a text chat with /api/bot/chat. The whole surface is gated
// on NEXT_PUBLIC_BOT_ENABLED so the feature can be toggled off without a
// redeploy.
//
// Phase 4 adds an optional "Live" mode on top, gated separately on
// NEXT_PUBLIC_BOT_LIVE_MODE_ENABLED. When the flag is on, a mode toggle in
// the drawer header lets the visitor swap between the Phase 3 stitched
// pipeline and the Gemini Live bidirectional pipeline (`useLiveVoice`), so
// the two can be A/B compared in real use — exactly what the plan's Phase 4
// exit criterion asks for.

const MAX_USER_MESSAGE_CHARS = 2000;

const GREETING =
  "Hey — I'm here to tell you why Joel would be a great fit for your team. What's the role you're hiring for?";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

function makeId(): string {
  return Math.random().toString(36).slice(2);
}

function initialMessages(): ChatMessage[] {
  return [{ id: makeId(), role: "assistant", content: GREETING }];
}

const MotionBox = motion(Box);

// Subtle pulse used on the bot avatar while audio is being spoken, and on the
// mic button while the browser is actively listening to the visitor.
const pulseRing = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(127, 127, 127, 0.35); }
  70%  { box-shadow: 0 0 0 8px rgba(127, 127, 127, 0); }
  100% { box-shadow: 0 0 0 0 rgba(127, 127, 127, 0); }
`;

interface AvatarProps {
  role: ChatRole;
  speaking?: boolean;
}

function Avatar({ role, speaking = false }: AvatarProps) {
  const primary = useColorModeValue(
    ColorScheme.light.primary,
    ColorScheme.dark.primary,
  );
  const secondary = useColorModeValue(
    ColorScheme.light.secondary,
    ColorScheme.dark.secondary,
  );
  const textColor = useColorModeValue(
    ColorScheme.light.text,
    ColorScheme.dark.text,
  );
  const subtleBg = useColorModeValue(
    "rgba(0,0,0,0.04)",
    "rgba(255,255,255,0.06)",
  );
  const subtleBorder = useColorModeValue(
    "rgba(0,0,0,0.08)",
    "rgba(255,255,255,0.08)",
  );

  const isBot = role === "assistant";
  const animation =
    isBot && speaking ? `${pulseRing} 1.4s ease-out infinite` : undefined;

  return (
    <Flex
      w={8}
      h={8}
      minW={8}
      borderRadius="full"
      alignItems="center"
      justifyContent="center"
      bg={isBot ? secondary : subtleBg}
      border="1px solid"
      borderColor={isBot ? primary : subtleBorder}
      color={isBot ? primary : textColor}
      opacity={isBot ? 1 : 0.7}
      animation={animation}
      aria-label={isBot && speaking ? "Bot is speaking" : undefined}
    >
      <Icon as={isBot ? BsStars : FaUser} fontSize="sm" />
    </Flex>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
  isSpeaking?: boolean;
}

function MessageBubble({ message, isStreaming, isSpeaking }: MessageBubbleProps) {
  const cardBg = useColorModeValue(
    ColorScheme.light.cardBg,
    ColorScheme.dark.cardBg,
  );
  const cardBorder = useColorModeValue(
    ColorScheme.light.cardBorder,
    ColorScheme.dark.cardBorder,
  );
  const textColor = useColorModeValue(
    ColorScheme.light.text,
    ColorScheme.dark.text,
  );

  const isUser = message.role === "user";

  return (
    <HStack
      align="flex-start"
      spacing={3}
      flexDirection={isUser ? "row-reverse" : "row"}
      w="full"
    >
      <Avatar role={message.role} speaking={isSpeaking} />
      <Box
        bg={cardBg}
        border="1px solid"
        borderColor={cardBorder}
        borderRadius="xl"
        backdropFilter="blur(20px)"
        px={4}
        py={3}
        maxW="85%"
      >
        <Text
          fontSize="sm"
          fontFamily={FontScheme.body}
          color={textColor}
          opacity={0.9}
          lineHeight="1.6"
          whiteSpace="pre-wrap"
        >
          {message.content}
          {isStreaming && message.content.length === 0 ? "…" : null}
        </Text>
      </Box>
    </HStack>
  );
}

interface BotChatProps {
  onClose: () => void;
}

function BotChat({ onClose }: BotChatProps) {
  const cardBorder = useColorModeValue(
    ColorScheme.light.cardBorder,
    ColorScheme.dark.cardBorder,
  );
  const textColor = useColorModeValue(
    ColorScheme.light.text,
    ColorScheme.dark.text,
  );
  const primaryColor = useColorModeValue(
    ColorScheme.light.primary,
    ColorScheme.dark.primary,
  );
  const inputBg = useColorModeValue(
    "rgba(0,0,0,0.02)",
    "rgba(255,255,255,0.04)",
  );
  const sendButtonColor = useColorModeValue("white", "#0a0a0a");

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  // Phase 4 — Live mode is optional and gated behind a build-time flag so
  // the feature can be toggled off in prod without a redeploy. When the
  // flag is off the toggle isn't rendered at all and the drawer behaves
  // exactly like Phase 3.
  const liveModeAvailable =
    process.env.NEXT_PUBLIC_BOT_LIVE_MODE_ENABLED === "true";
  const [mode, setMode] = useState<"text" | "live">("text");
  // Holds the id of the assistant bubble currently being streamed by the
  // Live session, so outputTranscription deltas append to the right
  // message.
  const liveAssistantIdRef = useRef<string | null>(null);

  const streamingIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const listEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  // Always-fresh snapshot of `messages` so voice callbacks (which close over
  // the first render's state) can read the up-to-date history without being
  // re-bound every turn.
  const messagesRef = useRef<ChatMessage[]>(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Latency probe for Phase 3 exit criteria: stamp the moment the browser
  // tells us the visitor has stopped speaking, then diff against the first
  // audio byte landing from /api/bot/speak. Logged (dev only) as a single
  // console line — target is < 2s.
  const speechEndAtRef = useRef<number | null>(null);

  const playback = useVoicePlayback({
    muted,
    onFirstAudioByte: () => {
      const t0 = speechEndAtRef.current;
      if (t0 == null) return;
      speechEndAtRef.current = null;
      const elapsed = performance.now() - t0;
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.info(
          `[bot] speech-end → first audio byte: ${elapsed.toFixed(0)}ms`,
        );
      }
    },
  });
  // Keep a ref to the live playback handle so `submitMessage` (a stable
  // callback) can always reach the latest version without listing the whole
  // playback object as a dependency.
  const playbackRef = useRef(playback);
  useEffect(() => {
    playbackRef.current = playback;
  }, [playback]);

  // Keep the message list pinned to the latest content, including while the
  // assistant response is still streaming in.
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // Focus the input when the drawer mounts so visitors can start typing
  // without an extra click.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => {
      cancelAnimationFrame(id);
      abortRef.current?.abort();
    };
  }, []);

  const submitMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return;
      if (trimmed.length > MAX_USER_MESSAGE_CHARS) {
        setError(
          `Please keep messages under ${MAX_USER_MESSAGE_CHARS} characters.`,
        );
        return;
      }

      setError(null);
      setIsSending(true);

      const userMessage: ChatMessage = {
        id: makeId(),
        role: "user",
        content: trimmed,
      };
      const assistantId = makeId();
      streamingIdRef.current = assistantId;

      // New turn — reset the playback cursor and stop any lingering audio
      // from the previous answer.
      playbackRef.current.reset();

      // Snapshot the outgoing conversation (user turn included) so the server
      // gets a consistent history even though React state updates are async.
      const outgoing = [...messagesRef.current, userMessage].map(
        ({ role, content }) => ({ role, content }),
      );

      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/bot/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: outgoing }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          const payload = await response
            .json()
            .catch(() => ({ error: `Request failed (${response.status})` }));
          throw new Error(
            payload.error ?? `Request failed (${response.status})`,
          );
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let streamed = "";

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (!chunk) continue;
          streamed += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: streamed } : m,
            ),
          );
          // Feed the cumulative text into the playback hook; it will pick
          // out any newly-completed sentences and synthesize them.
          playbackRef.current.enqueue(streamed);
        }

        // Flush any trailing bytes held by the decoder.
        const tail = decoder.decode();
        if (tail) {
          streamed += tail;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: streamed } : m,
            ),
          );
          playbackRef.current.enqueue(streamed);
        }

        // Speak anything left over after the last sentence boundary.
        playbackRef.current.flush();
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          // Drawer was closed mid-stream — leave the partial assistant
          // message alone, it will disappear with state when the drawer
          // reopens.
          return;
        }
        const messageText =
          err instanceof Error ? err.message : "Something went wrong.";
        setError(messageText);
        // Drop the empty assistant placeholder so the UI doesn't show an
        // empty bubble after a failure.
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        if (streamingIdRef.current === assistantId) {
          streamingIdRef.current = null;
        }
        abortRef.current = null;
        setIsSending(false);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    },
    [isSending],
  );

  const sendDraft = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setDraft("");
    void submitMessage(trimmed);
  }, [draft, submitMessage]);

  // Phase 4 — Gemini Live bidirectional voice. Transcripts get folded into
  // the same `messages` state the Phase 3 pipeline uses so the chat list
  // looks the same regardless of which pipeline produced the turn.
  const liveVoice = useLiveVoice({
    muted,
    onUserTranscript: (text) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      // Drop the initial greeting bubble on the very first live turn so
      // the conversation reads like a real exchange rather than the bot
      // talking past a canned opener.
      setMessages((prev) => {
        const withoutGreeting =
          prev.length === 1 &&
          prev[0]!.role === "assistant" &&
          prev[0]!.content === GREETING
            ? []
            : prev;
        return [
          ...withoutGreeting,
          { id: makeId(), role: "user", content: trimmed },
        ];
      });
      // Prepare a fresh assistant bubble for the bot's reply — Live voice
      // streams transcript deltas into it as audio plays back.
      const assistantId = makeId();
      liveAssistantIdRef.current = assistantId;
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);
    },
    onBotTranscriptDelta: (delta) => {
      const id = liveAssistantIdRef.current;
      if (!id) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, content: m.content + delta } : m,
        ),
      );
    },
    onTurnComplete: () => {
      liveAssistantIdRef.current = null;
    },
    onInterrupted: () => {
      // Server interrupted the bot because the visitor started speaking.
      // The current assistant bubble stays with whatever text landed; a
      // new one is created on the next onUserTranscript callback.
      liveAssistantIdRef.current = null;
    },
  });

  const voice = useVoiceInput({
    onSpeechEnd: () => {
      // Stamp the exact moment speech ends — diffed against the first audio
      // byte in onFirstAudioByte above.
      speechEndAtRef.current = performance.now();
    },
    onFinalTranscript: (transcript) => {
      // Voice finalised — ship it straight to the chat route. Clear any
      // interim that might have leaked into the draft first.
      setDraft("");
      void submitMessage(transcript);
    },
  });

  const handleMicToggle = useCallback(() => {
    if (!voice.supported) return;
    if (voice.listening) {
      voice.stop();
      return;
    }
    // Starting to listen — silence any bot audio that's still playing so the
    // two audio streams don't collide and the mic doesn't re-pick up the
    // bot's own voice.
    playbackRef.current.stop();
    voice.start();
  }, [voice]);

  const handleMuteToggle = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  const handleModeToggle = useCallback(() => {
    // Leaving Live mode must tear down the session so the mic and
    // WebSocket don't leak; entering Live mode is a no-op until the
    // visitor clicks "start".
    setMode((prev) => {
      const next = prev === "text" ? "live" : "text";
      if (prev === "live") {
        liveVoice.stop();
        liveAssistantIdRef.current = null;
      }
      return next;
    });
  }, [liveVoice]);

  const handleLiveStart = useCallback(() => {
    // Stop the Phase 3 playback so the two audio pipelines don't overlap.
    playbackRef.current.stop();
    void liveVoice.start();
  }, [liveVoice]);

  const handleLiveStop = useCallback(() => {
    liveVoice.stop();
    liveAssistantIdRef.current = null;
  }, [liveVoice]);

  // Keyboard shortcuts, drawer-scoped:
  //   - Space (when focus is NOT in the textarea) → toggle mic
  //   - Escape → stop bot playback / cancel recording
  // The space binding intentionally bypasses the textarea so the visitor can
  // still type a literal space while drafting a text question.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        let handled = false;
        if (mode === "live") {
          if (liveVoice.status !== "idle") {
            liveVoice.stop();
            handled = true;
          }
        } else {
          if (playbackRef.current.speaking) {
            playbackRef.current.stop();
            handled = true;
          }
          if (voice.listening) {
            voice.stop();
            handled = true;
          }
        }
        if (handled) {
          event.stopPropagation();
        }
        return;
      }
      if (event.key === " " || event.code === "Space") {
        const target = event.target as HTMLElement | null;
        const tag = target?.tagName;
        if (tag === "TEXTAREA" || tag === "INPUT") return;
        if (event.repeat) return;
        if (mode === "live") {
          // In Live mode Space toggles the whole session, not a
          // push-to-talk state — the mic is always hot once it's running.
          event.preventDefault();
          if (liveVoice.status === "idle" || liveVoice.status === "error") {
            handleLiveStart();
          } else {
            handleLiveStop();
          }
          return;
        }
        event.preventDefault();
        handleMicToggle();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    handleMicToggle,
    voice,
    mode,
    liveVoice,
    handleLiveStart,
    handleLiveStop,
  ]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendDraft();
    }
  };

  const streamingId = streamingIdRef.current;
  const streamingAssistantId = isSending ? streamingId : null;

  // While listening, show the live interim transcript in the textarea so the
  // visitor can see what's being captured. Falls back to the draft otherwise.
  const textareaValue = voice.listening
    ? voice.interimTranscript
    : draft;
  const textareaDisabled = isSending || voice.listening;
  const textareaPlaceholder = voice.listening
    ? "Listening…"
    : "Ask about Joel's experience, projects, or fit for a role…";

  const micUnsupportedHint = useMemo(() => {
    if (voice.supported) return null;
    return "Voice input isn't available in this browser — you can still type.";
  }, [voice.supported]);

  const voiceError = voice.error;

  return (
    <>
      <DrawerHeader
        borderBottom="1px solid"
        borderColor={cardBorder}
        px={6}
        py={4}
      >
        <Flex alignItems="center" justifyContent="space-between">
          <HStack spacing={3}>
            <Flex
              w={9}
              h={9}
              borderRadius="full"
              alignItems="center"
              justifyContent="center"
              border="1px solid"
              borderColor={primaryColor}
              color={primaryColor}
            >
              <Icon as={BsStars} fontSize="md" />
            </Flex>
            <Box>
              <Text
                fontSize="sm"
                fontWeight="semibold"
                fontFamily={FontScheme.body}
                color={textColor}
                lineHeight="1.2"
              >
                Joel&apos;s AI advocate
              </Text>
              <Text
                fontSize="xs"
                fontFamily={FontScheme.body}
                color={textColor}
                opacity={0.5}
              >
                Grounded in Joel&apos;s portfolio. Not Joel himself.
              </Text>
            </Box>
          </HStack>
          <HStack spacing={1}>
            {liveModeAvailable ? (
              <Tooltip
                label={
                  mode === "live"
                    ? "Switch to text chat"
                    : "Switch to live voice"
                }
                openDelay={300}
              >
                <IconButton
                  aria-label={
                    mode === "live"
                      ? "Switch to text chat"
                      : "Switch to live voice"
                  }
                  aria-pressed={mode === "live"}
                  icon={
                    <Icon
                      as={mode === "live" ? BsChatDots : BsBroadcast}
                      fontSize="md"
                    />
                  }
                  variant="ghost"
                  size="sm"
                  color={mode === "live" ? primaryColor : undefined}
                  onClick={handleModeToggle}
                />
              </Tooltip>
            ) : null}
            <Tooltip
              label={muted ? "Unmute voice" : "Mute voice"}
              openDelay={300}
            >
              <IconButton
                aria-label={muted ? "Unmute bot voice" : "Mute bot voice"}
                aria-pressed={muted}
                icon={
                  <Icon
                    as={muted ? BsVolumeMuteFill : BsVolumeUpFill}
                    fontSize="md"
                  />
                }
                variant="ghost"
                size="sm"
                onClick={handleMuteToggle}
              />
            </Tooltip>
            <IconButton
              aria-label="Close chat"
              icon={<CloseIcon boxSize={3} />}
              variant="ghost"
              size="sm"
              onClick={onClose}
            />
          </HStack>
        </Flex>
      </DrawerHeader>

      <DrawerBody px={{ base: 4, md: 6 }} py={5}>
        <VStack
          spacing={4}
          align="stretch"
          aria-live="polite"
          aria-label="Chat messages"
        >
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              isStreaming={m.id === streamingId}
              isSpeaking={
                playback.speaking && m.id === streamingAssistantId
              }
            />
          ))}
          <div ref={listEndRef} />
        </VStack>
      </DrawerBody>

      <DrawerFooter
        borderTop="1px solid"
        borderColor={cardBorder}
        flexDirection="column"
        alignItems="stretch"
        px={{ base: 4, md: 6 }}
        py={4}
        gap={2}
      >
        {error ? (
          <Text fontSize="xs" color="red.400" fontFamily={FontScheme.body}>
            {error}
          </Text>
        ) : null}
        {mode === "text" && voiceError ? (
          <Text fontSize="xs" color="red.400" fontFamily={FontScheme.body}>
            Voice input error: {voiceError}
          </Text>
        ) : null}
        {mode === "text" && micUnsupportedHint ? (
          <Text
            fontSize="xs"
            color={textColor}
            opacity={0.55}
            fontFamily={FontScheme.body}
          >
            {micUnsupportedHint}
          </Text>
        ) : null}
        {mode === "live" && liveVoice.error ? (
          <Text fontSize="xs" color="red.400" fontFamily={FontScheme.body}>
            Live voice error: {liveVoice.error}
          </Text>
        ) : null}
        {mode === "live" ? (
          <VStack align="stretch" spacing={2}>
            <Text
              fontSize="xs"
              color={textColor}
              opacity={0.55}
              fontFamily={FontScheme.body}
              textAlign="center"
            >
              {liveVoice.status === "listening"
                ? "Live — just start talking. Press Esc or Stop when you're done."
                : liveVoice.status === "connecting"
                  ? "Connecting to Gemini Live…"
                  : "Live voice uses Gemini's bidirectional audio — lower latency and barge-in. Tap to start."}
            </Text>
            <Flex justifyContent="center">
              {liveVoice.status === "idle" ||
              liveVoice.status === "error" ? (
                <Box
                  as="button"
                  onClick={handleLiveStart}
                  aria-label="Start live voice conversation"
                  display="inline-flex"
                  alignItems="center"
                  gap={2}
                  px={5}
                  py={3}
                  bg={primaryColor}
                  color={sendButtonColor}
                  borderRadius="full"
                  fontFamily={FontScheme.body}
                  fontSize="sm"
                  fontWeight="medium"
                  cursor="pointer"
                  transition="all 0.2s ease"
                  _hover={{ opacity: 0.9 }}
                >
                  <Icon as={BsBroadcast} />
                  Start live conversation
                </Box>
              ) : (
                <Box
                  as="button"
                  onClick={handleLiveStop}
                  aria-label="Stop live voice conversation"
                  display="inline-flex"
                  alignItems="center"
                  gap={2}
                  px={5}
                  py={3}
                  bg="transparent"
                  color={primaryColor}
                  border="1px solid"
                  borderColor={primaryColor}
                  borderRadius="full"
                  fontFamily={FontScheme.body}
                  fontSize="sm"
                  fontWeight="medium"
                  cursor="pointer"
                  transition="all 0.2s ease"
                  _hover={{ opacity: 0.85 }}
                  animation={
                    liveVoice.status === "listening"
                      ? `${pulseRing} 1.4s ease-out infinite`
                      : undefined
                  }
                >
                  <Icon
                    as={
                      liveVoice.status === "listening"
                        ? BsStopFill
                        : BsMicFill
                    }
                  />
                  {liveVoice.status === "listening"
                    ? "Stop"
                    : "Connecting…"}
                </Box>
              )}
            </Flex>
          </VStack>
        ) : (
        <HStack align="flex-end" spacing={3}>
          <Textarea
            ref={inputRef}
            value={textareaValue}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={textareaPlaceholder}
            rows={2}
            resize="none"
            bg={inputBg}
            border="1px solid"
            borderColor={voice.listening ? primaryColor : cardBorder}
            fontSize="sm"
            fontFamily={FontScheme.body}
            _focus={{ borderColor: primaryColor, boxShadow: "none" }}
            maxLength={MAX_USER_MESSAGE_CHARS}
            aria-label="Message"
            isDisabled={textareaDisabled}
          />
          <Tooltip
            label={
              voice.supported
                ? voice.listening
                  ? "Stop listening (Space / Esc)"
                  : "Hold Space or click to talk"
                : "Voice input not supported in this browser"
            }
            openDelay={300}
          >
            <IconButton
              aria-label={
                voice.listening ? "Stop voice input" : "Start voice input"
              }
              aria-pressed={voice.listening}
              icon={
                <Icon
                  as={voice.listening ? BsMicMuteFill : BsMicFill}
                  fontSize="md"
                />
              }
              onClick={handleMicToggle}
              isDisabled={!voice.supported || isSending}
              variant="outline"
              borderColor={voice.listening ? primaryColor : cardBorder}
              color={voice.listening ? primaryColor : textColor}
              bg={voice.listening ? "transparent" : inputBg}
              animation={
                voice.listening
                  ? `${pulseRing} 1.4s ease-out infinite`
                  : undefined
              }
              _hover={{ borderColor: primaryColor }}
              borderRadius="lg"
            />
          </Tooltip>
          <IconButton
            aria-label="Send message"
            icon={<Icon as={BsSend} />}
            onClick={sendDraft}
            isLoading={isSending}
            isDisabled={draft.trim().length === 0 || voice.listening}
            bg={primaryColor}
            color={sendButtonColor}
            _hover={{ opacity: 0.85 }}
            borderRadius="lg"
          />
        </HStack>
        )}
      </DrawerFooter>
    </>
  );
}

export default function BotLauncher() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const primaryColor = useColorModeValue(
    ColorScheme.light.primary,
    ColorScheme.dark.primary,
  );
  const drawerBg = useColorModeValue(
    ColorScheme.light.bg,
    ColorScheme.dark.bg,
  );
  const buttonText = useColorModeValue("white", "#0a0a0a");

  // Feature flag — mounted once at the root of the page. When the flag is
  // off we render nothing so the feature is completely invisible (and the
  // /api/bot/chat route returns 404 on the server side for defence-in-depth).
  if (process.env.NEXT_PUBLIC_BOT_ENABLED !== "true") {
    return null;
  }

  const handleClose = () => {
    onClose();
    requestAnimationFrame(() => {
      btnRef.current?.focus({ preventScroll: true });
    });
  };

  return (
    <>
      <MotionBox
        position="fixed"
        bottom={{ base: 5, md: 8 }}
        right={{ base: 5, md: 8 }}
        zIndex={1000}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
      >
        <Box
          as="button"
          ref={btnRef}
          onClick={onOpen}
          aria-label="Ask Joel's AI advocate"
          display="inline-flex"
          alignItems="center"
          gap={2}
          px={5}
          py={3}
          bg={primaryColor}
          color={buttonText}
          borderRadius="full"
          fontFamily={FontScheme.body}
          fontSize="sm"
          fontWeight="medium"
          cursor="pointer"
          boxShadow="0 10px 30px rgba(0,0,0,0.15)"
          transition="all 0.2s ease"
          _hover={{ transform: "translateY(-2px)", opacity: 0.92 }}
          _focusVisible={{
            outline: "2px solid",
            outlineColor: primaryColor,
            outlineOffset: "3px",
          }}
        >
          <Icon as={BsStars} />
          Ask AI
        </Box>
      </MotionBox>

      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={handleClose}
        size={{ base: "full", md: "md" }}
        returnFocusOnClose={false}
      >
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent bg={drawerBg} fontFamily={FontScheme.body}>
          <BotChat onClose={handleClose} />
        </DrawerContent>
      </Drawer>
    </>
  );
}
