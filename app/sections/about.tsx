"use client";

import {
  Box,
  Flex,
  HStack,
  Icon,
  Stack,
  Text,
  keyframes,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { BsStars } from "react-icons/bs";

import ColorScheme from "../assets/colors";
import FontScheme from "../assets/fonts";
import aboutContent from "../content/about";
import Title from "../components/title";
import {
  OPEN_BOT_EVENT,
  type OpenBotDetail,
} from "./bot-launcher";

// The About section is now a terse intro + an animated AI advocate button.
// Clicking the button dispatches OPEN_BOT_EVENT with `mode: 'live'`, which
// the BotLauncher picks up (see app/sections/bot-launcher.tsx) to open the
// drawer straight into the Gemini Live pipeline. If Live mode is disabled
// via the env flag, the launcher gracefully falls back to text mode — the
// About section doesn't need to know either way.

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// Slow, ambient pulse on the button's outer glow ring. Intentionally
// low-key — the rest of the site doesn't animate aggressively and the
// button should invite a click without begging for one.
const glowPulse = keyframes`
  0%   { transform: scale(1);    opacity: 0.45; }
  50%  { transform: scale(1.15); opacity: 0.15; }
  100% { transform: scale(1);    opacity: 0.45; }
`;

// Secondary inner-ring pulse, offset from the outer one so the effect
// feels layered rather than mechanical.
const innerPulse = keyframes`
  0%   { transform: scale(1);   opacity: 0.7; }
  50%  { transform: scale(1.08); opacity: 0.2; }
  100% { transform: scale(1);   opacity: 0.7; }
`;

// Subtle conic-gradient sweep around the border so the button reads as
// "alive" without resorting to a harsh rotating border.
const shimmer = keyframes`
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

function openBot(detail: OpenBotDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_BOT_EVENT, { detail }));
}

export default function AboutMe() {
  const textColor = useColorModeValue(
    ColorScheme.light.text,
    ColorScheme.dark.text,
  );
  const primaryColor = useColorModeValue(
    ColorScheme.light.primary,
    ColorScheme.dark.primary,
  );
  const secondaryColor = useColorModeValue(
    ColorScheme.light.secondary,
    ColorScheme.dark.secondary,
  );
  const buttonTextColor = useColorModeValue("white", "#0a0a0a");
  const subtleBorder = useColorModeValue(
    "rgba(0,0,0,0.08)",
    "rgba(255,255,255,0.08)",
  );

  const handleAskAI = () => {
    // Ask BotLauncher to open in Live mode. If the Live env flag is off,
    // the launcher will still open the drawer but stay in text mode — no
    // branching needed here.
    openBot({ mode: "live" });
  };

  return (
    <Stack alignItems="flex-start" textAlign="left">
      <Title>about me.</Title>

      <Box
        py={{ base: 8, md: 10 }}
        display="flex"
        flexDirection="column"
        gap={5}
        maxW="640px"
      >
        {aboutContent.intro.map((paragraph, index) => (
          <Text
            key={index}
            fontSize={{ base: "md", md: "lg" }}
            color={textColor}
            opacity={index === 0 ? 0.9 : 0.6}
            fontFamily={FontScheme.body}
            lineHeight="1.7"
          >
            {paragraph}
          </Text>
        ))}
      </Box>

      {/* Animated AI advocate CTA — wraps the button in two layered pulse
          rings so it draws the eye without being obnoxious. */}
      <MotionBox
        position="relative"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Outer ambient glow — a wide, blurred primary-colored disk that
            slowly breathes behind the button. */}
        <Box
          position="absolute"
          inset={0}
          borderRadius="full"
          bg={primaryColor}
          filter="blur(32px)"
          opacity={0.35}
          animation={`${glowPulse} 4.5s ease-in-out infinite`}
          pointerEvents="none"
          aria-hidden
        />

        {/* Inner pulse ring — tighter, higher opacity, faster cadence. */}
        <Box
          position="absolute"
          inset="-4px"
          borderRadius="full"
          border="1px solid"
          borderColor={primaryColor}
          opacity={0.35}
          animation={`${innerPulse} 2.8s ease-in-out infinite`}
          pointerEvents="none"
          aria-hidden
        />

        <MotionFlex
          as="button"
          onClick={handleAskAI}
          aria-label="Ask Joel's AI advocate — opens a live voice conversation"
          alignItems="center"
          gap={3}
          position="relative"
          px={{ base: 6, md: 7 }}
          py={{ base: 3.5, md: 4 }}
          borderRadius="full"
          border="1px solid"
          borderColor={subtleBorder}
          fontFamily={FontScheme.body}
          fontWeight="semibold"
          fontSize={{ base: "sm", md: "md" }}
          color={buttonTextColor}
          cursor="pointer"
          overflow="hidden"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          style={{
            // Layered background: an animated linear-gradient sweep sits
            // on top of the solid primary color so the surface reads as
            // "intelligent" without drifting too far from the site's
            // existing pill-button language.
            backgroundColor: primaryColor,
            backgroundImage: `linear-gradient(110deg, ${primaryColor} 0%, ${secondaryColor} 40%, ${primaryColor} 80%)`,
            backgroundSize: "220% 100%",
            animation: `${shimmer} 6s ease-in-out infinite`,
            boxShadow: `0 18px 40px -16px ${primaryColor}`,
          }}
          _focusVisible={{
            outline: "2px solid",
            outlineColor: primaryColor,
            outlineOffset: "4px",
          }}
        >
          {/* Spinning accent star — slow, CSS-driven; matches the BsStars
              iconography used throughout the bot UI. */}
          <MotionBox
            animate={{ rotate: [0, 10, -6, 0] }}
            transition={{
              duration: 3.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            display="inline-flex"
          >
            <Icon as={BsStars} fontSize={{ base: "lg", md: "xl" }} />
          </MotionBox>

          <Text as="span" lineHeight="1" whiteSpace="nowrap">
            Talk to my AI advocate
          </Text>
        </MotionFlex>
      </MotionBox>

      <HStack
        spacing={2}
        pt={4}
        opacity={0.55}
        color={textColor}
        fontFamily={FontScheme.body}
        fontSize="xs"
      >
        <Box
          w={1.5}
          h={1.5}
          borderRadius="full"
          bg={primaryColor}
          animation={`${innerPulse} 1.8s ease-in-out infinite`}
        />
        <Text as="span">
          Live voice conversation — powered by Gemini, grounded in Joel&apos;s
          real work.
        </Text>
      </HStack>
    </Stack>
  );
}
