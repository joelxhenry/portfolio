"use client";

import {
  Box,
  Flex,
  HStack,
  Icon,
  IconButton,
  Modal,
  ModalContent,
  ModalOverlay,
  Stack,
  Text,
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
  BsMicFill,
  BsStars,
  BsStopFill,
  BsVolumeMuteFill,
  BsVolumeUpFill,
} from "react-icons/bs";

import ColorScheme from "../assets/colors";
import FontScheme from "../assets/fonts";
import BotVisualizer from "../components/bot-visualizer";
import { useLiveVoice } from "../lib/bot/useLiveVoice";

// Phase 4 UI, second iteration — the text chat is gone. The only bot
// experience on the site is now a live, bidirectional Gemini voice
// conversation rendered inside a centered Chakra Modal. A single floating
// "Ask AI" button triggers it; the About section's animated advocate
// button dispatches the same window event (`OPEN_BOT_EVENT`) so both
// entry points open the same modal.
//
// Audio plumbing stays in `useLiveVoice`. This file owns the dialog UI:
// the layered visualizer, the transcripts strip, status copy, mic/mute
// controls, and the window-event glue.

// Event other sections dispatch to open the dialog. Kept exported so the
// AboutMe section can import it without poking at the launcher's
// internals. Detail payload is deliberately empty for now — every open
// lands in the live experience.
export const OPEN_BOT_EVENT = "portfolio:open-bot";
export interface OpenBotDetail {
  /** Reserved for future use. */
  mode?: "live";
}

type TranscriptRole = "user" | "assistant";

interface TranscriptEntry {
  id: string;
  role: TranscriptRole;
  content: string;
}

function makeId(): string {
  return Math.random().toString(36).slice(2);
}

const MotionBox = motion(Box);

// Subtle pulse reused on the status dot and the Stop button ring.
const pulseRing = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(127, 127, 127, 0.35); }
  70%  { box-shadow: 0 0 0 10px rgba(127, 127, 127, 0); }
  100% { box-shadow: 0 0 0 0 rgba(127, 127, 127, 0); }
`;

interface LiveBotDialogProps {
  onClose: () => void;
  /**
   * When true, the dialog should attempt to auto-start the session on
   * mount. Set by the window-event handler so visitors landing here from
   * the About section don't have to click twice.
   */
  autoStart: boolean;
}

function LiveBotDialog({ onClose, autoStart }: LiveBotDialogProps) {
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
  const bubbleBg = useColorModeValue(
    "rgba(0,0,0,0.035)",
    "rgba(255,255,255,0.05)",
  );
  const bubbleBorder = useColorModeValue(
    "rgba(0,0,0,0.08)",
    "rgba(255,255,255,0.08)",
  );
  const startButtonText = useColorModeValue("white", "#0a0a0a");

  const [muted, setMuted] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const assistantTurnIdRef = useRef<string | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  const liveVoice = useLiveVoice({
    muted,
    onUserTranscript: (text) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setTranscripts((prev) => [
        ...prev,
        { id: makeId(), role: "user", content: trimmed },
      ]);
      // Pre-seed an empty assistant turn so subsequent transcript deltas
      // have somewhere to land.
      const assistantId = makeId();
      assistantTurnIdRef.current = assistantId;
      setTranscripts((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);
    },
    onBotTranscriptDelta: (delta) => {
      const id = assistantTurnIdRef.current;
      if (!id) return;
      setTranscripts((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, content: entry.content + delta } : entry,
        ),
      );
    },
    onTurnComplete: () => {
      assistantTurnIdRef.current = null;
    },
    onInterrupted: () => {
      // Visitor barged in — drop the placeholder so the next user turn
      // gets a clean assistant bubble.
      assistantTurnIdRef.current = null;
    },
  });

  // Keep the transcript list pinned to the latest entry as new deltas
  // arrive.
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [transcripts]);

  const handleStart = useCallback(() => {
    void liveVoice.start();
  }, [liveVoice]);

  const handleStop = useCallback(() => {
    liveVoice.stop();
    assistantTurnIdRef.current = null;
  }, [liveVoice]);

  const handleMuteToggle = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  // Optional auto-start: if the caller opened the dialog from the About
  // section's animated AI button, we try to kick the session off
  // immediately. The click on that button counts as a user gesture, so
  // `getUserMedia` and AudioContext resume are allowed.
  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (autoStart && !autoStartedRef.current) {
      autoStartedRef.current = true;
      void liveVoice.start();
    }
    // We intentionally do not add `liveVoice.start` to deps — we want
    // this effect to fire exactly once when the dialog mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  // Tear everything down whenever the dialog unmounts, mic leaks are no
  // joke.
  useEffect(() => {
    return () => {
      liveVoice.stop();
    };
    // liveVoice.stop is stable per session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard: Esc ends the session AND closes the dialog (Chakra already
  // handles the close; we add the session teardown).
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (liveVoice.status !== "idle") {
          liveVoice.stop();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [liveVoice]);

  const statusCopy = useMemo(() => {
    switch (liveVoice.status) {
      case "connecting":
        return "Connecting to Gemini Live…";
      case "listening":
        return liveVoice.speaking
          ? "Joel's AI is speaking — start talking to interrupt."
          : "Listening. Just start talking — no need to click anything.";
      case "error":
        return "Something went wrong. Tap to try again.";
      default:
        return "Ask Joel's AI advocate anything. It's read the whole resume.";
    }
  }, [liveVoice.status, liveVoice.speaking]);

  const visualizerState =
    liveVoice.status === "error"
      ? "error"
      : liveVoice.status === "connecting"
        ? "connecting"
        : liveVoice.status === "listening"
          ? liveVoice.speaking
            ? "speaking"
            : "listening"
          : "idle";

  const sessionActive =
    liveVoice.status === "listening" || liveVoice.status === "connecting";

  return (
    <>
      {/* === Header ======================================== */}
      <Flex
        alignItems="center"
        justifyContent="space-between"
        px={{ base: 5, md: 7 }}
        py={4}
        borderBottom="1px solid"
        borderColor={cardBorder}
      >
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
            <HStack spacing={2} mt={0.5}>
              <Box
                w={1.5}
                h={1.5}
                borderRadius="full"
                bg={
                  liveVoice.status === "listening"
                    ? primaryColor
                    : liveVoice.status === "error"
                      ? "red.400"
                      : "gray.400"
                }
                animation={
                  sessionActive
                    ? `${pulseRing} 1.8s ease-out infinite`
                    : undefined
                }
              />
              <Text
                fontSize="xs"
                fontFamily={FontScheme.body}
                color={textColor}
                opacity={0.55}
              >
                Live voice · grounded in Joel&apos;s portfolio
              </Text>
            </HStack>
          </Box>
        </HStack>

        <HStack spacing={1}>
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
            aria-label="Close dialog"
            icon={<CloseIcon boxSize={3} />}
            variant="ghost"
            size="sm"
            onClick={onClose}
          />
        </HStack>
      </Flex>

      {/* === Visualizer ==================================== */}
      <Box
        position="relative"
        px={{ base: 4, md: 8 }}
        pt={{ base: 6, md: 10 }}
        pb={{ base: 4, md: 6 }}
      >
        <Box
          w="100%"
          h={{ base: "240px", md: "300px" }}
          position="relative"
        >
          <BotVisualizer
            state={visualizerState}
            getOutputAnalyser={liveVoice.getOutputAnalyser}
            getInputAnalyser={liveVoice.getInputAnalyser}
          />
        </Box>

        <Text
          mt={4}
          textAlign="center"
          fontSize="sm"
          fontFamily={FontScheme.body}
          color={textColor}
          opacity={0.72}
          px={4}
        >
          {statusCopy}
        </Text>

        {liveVoice.error ? (
          <Text
            mt={2}
            textAlign="center"
            fontSize="xs"
            color="red.400"
            fontFamily={FontScheme.body}
          >
            {liveVoice.error}
          </Text>
        ) : null}
      </Box>

      {/* === Transcripts ==================================== */}
      <Box
        mx={{ base: 4, md: 8 }}
        mb={4}
        border="1px solid"
        borderColor={bubbleBorder}
        borderRadius="xl"
        bg={bubbleBg}
        maxH={{ base: "140px", md: "160px" }}
        overflowY="auto"
        px={4}
        py={3}
      >
        {transcripts.length === 0 ? (
          <Text
            fontSize="xs"
            fontFamily={FontScheme.body}
            color={textColor}
            opacity={0.45}
            textAlign="center"
          >
            Transcripts will appear here as you talk.
          </Text>
        ) : (
          <VStack align="stretch" spacing={2}>
            {transcripts.map((entry) => (
              <Box key={entry.id}>
                <Text
                  fontSize="10px"
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                  fontFamily={FontScheme.body}
                  color={entry.role === "user" ? textColor : primaryColor}
                  opacity={0.55}
                  mb={0.5}
                >
                  {entry.role === "user" ? "You" : "Joel's AI"}
                </Text>
                <Text
                  fontSize="sm"
                  fontFamily={FontScheme.body}
                  color={textColor}
                  opacity={0.9}
                  lineHeight="1.55"
                  whiteSpace="pre-wrap"
                >
                  {entry.content || "…"}
                </Text>
              </Box>
            ))}
            <div ref={transcriptEndRef} />
          </VStack>
        )}
      </Box>

      {/* === Primary action ================================= */}
      <Flex
        justifyContent="center"
        alignItems="center"
        pb={{ base: 6, md: 8 }}
      >
        {sessionActive ? (
          <MotionBox
            as="button"
            onClick={handleStop}
            aria-label="Stop live voice conversation"
            display="inline-flex"
            alignItems="center"
            gap={2}
            px={6}
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
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            animation={
              liveVoice.status === "listening"
                ? `${pulseRing} 1.8s ease-out infinite`
                : undefined
            }
          >
            <Icon as={liveVoice.speaking ? BsStopFill : BsMicFill} />
            {liveVoice.status === "connecting" ? "Connecting…" : "Stop"}
          </MotionBox>
        ) : (
          <MotionBox
            as="button"
            onClick={handleStart}
            aria-label="Start live voice conversation"
            display="inline-flex"
            alignItems="center"
            gap={2}
            px={7}
            py={3.5}
            bg={primaryColor}
            color={startButtonText}
            borderRadius="full"
            fontFamily={FontScheme.body}
            fontSize="sm"
            fontWeight="semibold"
            cursor="pointer"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            boxShadow={`0 18px 40px -18px ${primaryColor}`}
          >
            <Icon as={BsBroadcast} />
            {liveVoice.status === "error"
              ? "Try again"
              : "Start conversation"}
          </MotionBox>
        )}
      </Flex>
    </>
  );
}

export default function BotLauncher() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const drawerBg = useColorModeValue(
    ColorScheme.light.bg,
    ColorScheme.dark.bg,
  );

  // The floating "Ask AI" button is gone — the only entry point now is
  // the animated advocate button in the About section, which dispatches
  // OPEN_BOT_EVENT. We auto-start the session on every open because the
  // dispatching click counts as a user gesture.
  const [autoStart, setAutoStart] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      // Dispatch detail is reserved but unused — every open is live.
      void (event as CustomEvent<OpenBotDetail>).detail;
      setAutoStart(true);
      onOpen();
    };
    window.addEventListener(OPEN_BOT_EVENT, handler as EventListener);
    return () => {
      window.removeEventListener(OPEN_BOT_EVENT, handler as EventListener);
    };
  }, [onOpen]);

  // Feature flag — when NEXT_PUBLIC_BOT_ENABLED is off we render nothing,
  // so the whole surface is invisible (and /api/bot/live-token returns
  // 404 on the server side for defence-in-depth).
  if (process.env.NEXT_PUBLIC_BOT_ENABLED !== "true") {
    return null;
  }

  const handleClose = () => {
    onClose();
    setAutoStart(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={{ base: "full", md: "xl" }}
      isCentered
      returnFocusOnClose={false}
    >
      <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
      <ModalContent
        bg={drawerBg}
        fontFamily={FontScheme.body}
        borderRadius={{ base: 0, md: "2xl" }}
        overflow="hidden"
        mx={{ base: 0, md: 4 }}
      >
        <Stack spacing={0}>
          <LiveBotDialog onClose={handleClose} autoStart={autoStart} />
        </Stack>
      </ModalContent>
    </Modal>
  );
}
