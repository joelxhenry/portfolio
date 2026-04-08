import ColorScheme from "../assets/colors";
import FontScheme from "../assets/fonts";
import {
  Box,
  Grid,
  GridItem,
  Heading,
  HStack,
  Stack,
  Text,
  useColorModeValue,
  Icon,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FaCode,
  FaDocker,
  FaAws,
  FaLaravel,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";
import {
  SiTypescript,
  SiReact,
  SiVuedotjs,
  SiNextdotjs,
  SiDotnet,
  SiPython,
} from "react-icons/si";
import { BsChatDots } from "react-icons/bs";
import { socials } from "../config/socials";

interface ContentProps {
  children: React.ReactNode;
}

export function Content({ children }: ContentProps) {
  return (
    <Text
      fontWeight={"medium"}
      opacity={1}
      fontSize={"16px"}
      fontFamily={FontScheme.body}
    >
      {children}
    </Text>
  );
}

const MotionBox = motion(Box);

const skillTags = [
  { label: "Full Stack", icon: FaCode },
  { label: "React", icon: SiReact },
  { label: "Vue", icon: SiVuedotjs },
  { label: "Next.js", icon: SiNextdotjs },
  { label: "TypeScript", icon: SiTypescript },
  { label: "Laravel", icon: FaLaravel },
  { label: ".NET", icon: SiDotnet },
  { label: "Python", icon: SiPython },
  { label: "DevOps", icon: FaDocker },
  { label: "AWS", icon: FaAws },
];

const iconMap: Record<string, any> = {
  FaGithub,
  FaLinkedin,
};

function HeroIllustration({ primary, text }: { primary: string; text: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", maxHeight: "420px" }}
    >
      {/* Abstract floating terminal window */}
      <rect
        x="60"
        y="60"
        width="220"
        height="160"
        rx="12"
        stroke={primary}
        strokeWidth="1.5"
        opacity="0.3"
      />
      {/* Terminal dots */}
      <circle cx="80" cy="80" r="4" fill={primary} opacity="0.5" />
      <circle cx="95" cy="80" r="4" fill={primary} opacity="0.35" />
      <circle cx="110" cy="80" r="4" fill={primary} opacity="0.2" />
      {/* Code lines */}
      <rect x="80" y="105" width="90" height="3" rx="1.5" fill={primary} opacity="0.25" />
      <rect x="80" y="120" width="140" height="3" rx="1.5" fill={primary} opacity="0.15" />
      <rect x="80" y="135" width="60" height="3" rx="1.5" fill={primary} opacity="0.25" />
      <rect x="80" y="150" width="110" height="3" rx="1.5" fill={primary} opacity="0.15" />
      <rect x="80" y="165" width="75" height="3" rx="1.5" fill={primary} opacity="0.2" />
      <rect x="80" y="180" width="130" height="3" rx="1.5" fill={primary} opacity="0.1" />

      {/* Floating bracket - left */}
      <text
        x="310"
        y="120"
        fontSize="60"
        fontFamily="monospace"
        fill={primary}
        opacity="0.15"
        fontWeight="300"
      >
        {"{"}
      </text>

      {/* Floating bracket - right */}
      <text
        x="330"
        y="200"
        fontSize="60"
        fontFamily="monospace"
        fill={primary}
        opacity="0.1"
        fontWeight="300"
      >
        {"}"}
      </text>

      {/* Connection nodes */}
      <circle cx="320" cy="260" r="6" fill={primary} opacity="0.3" />
      <circle cx="260" cy="290" r="4" fill={primary} opacity="0.2" />
      <circle cx="350" cy="300" r="5" fill={primary} opacity="0.15" />
      <circle cx="300" cy="330" r="3" fill={primary} opacity="0.25" />

      {/* Connection lines */}
      <line x1="320" y1="260" x2="260" y2="290" stroke={primary} strokeWidth="1" opacity="0.12" />
      <line x1="320" y1="260" x2="350" y2="300" stroke={primary} strokeWidth="1" opacity="0.1" />
      <line x1="260" y1="290" x2="300" y2="330" stroke={primary} strokeWidth="1" opacity="0.08" />
      <line x1="350" y1="300" x2="300" y2="330" stroke={primary} strokeWidth="1" opacity="0.1" />

      {/* Floating angle bracket */}
      <text
        x="40"
        y="310"
        fontSize="40"
        fontFamily="monospace"
        fill={primary}
        opacity="0.1"
        fontWeight="300"
      >
        {"</>"}
      </text>

      {/* Subtle orbit ring */}
      <ellipse
        cx="200"
        cy="250"
        rx="120"
        ry="40"
        stroke={primary}
        strokeWidth="0.8"
        opacity="0.08"
        strokeDasharray="6 8"
      />

      {/* Small accent dot */}
      <circle cx="140" cy="270" r="2.5" fill={primary} opacity="0.4" />
    </svg>
  );
}

export default function Header() {
  const cardBg = useColorModeValue(
    ColorScheme.light.cardBg,
    ColorScheme.dark.cardBg
  );
  const cardBorder = useColorModeValue(
    ColorScheme.light.cardBorder,
    ColorScheme.dark.cardBorder
  );
  const textColor = useColorModeValue(
    ColorScheme.light.text,
    ColorScheme.dark.text
  );
  const primaryColor = useColorModeValue(
    ColorScheme.light.primary,
    ColorScheme.dark.primary
  );
  const secondaryColor = useColorModeValue(
    ColorScheme.light.secondary,
    ColorScheme.dark.secondary
  );
  const tagBg = useColorModeValue(
    "rgba(0,0,0,0.04)",
    "rgba(255,255,255,0.06)"
  );
  const tagBorder = useColorModeValue(
    "rgba(0,0,0,0.08)",
    "rgba(255,255,255,0.08)"
  );

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      w="100%"
    >
      <Grid
        templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
        gap={5}
        alignItems="center"
      >
        {/* Left Side - Profile Card */}
        <GridItem>
          <Box
            bg={cardBg}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="2xl"
            backdropFilter="blur(20px)"
            p={{ base: 7, md: 10 }}
            position="relative"
            overflow="hidden"
          >
            {/* Subtle glow accent */}
            <Box
              position="absolute"
              bottom="-40px"
              left="-40px"
              w="200px"
              h="200px"
              bg={primaryColor}
              opacity={0.06}
              borderRadius="full"
              filter="blur(80px)"
              pointerEvents="none"
            />

            <Stack spacing={5}>
              {/* Name & Title */}
              <Box>
                <Heading
                  fontSize={{ base: "3xl", md: "4xl" }}
                  fontWeight="bold"
                  fontFamily={FontScheme.title}
                  color={textColor}
                  lineHeight="1.1"
                >
                  Joel Henry
                </Heading>
                <Text
                  fontSize={{ base: "sm", md: "md" }}
                  color={primaryColor}
                  fontFamily={FontScheme.body}
                  fontWeight="medium"
                  mt={2}
                >
                  Software Engineering Lead | Full-Stack Architect
                </Text>
              </Box>

              {/* Bio */}
              <Text
                fontSize={{ base: "sm", md: "md" }}
                color={textColor}
                opacity={0.5}
                fontFamily={FontScheme.body}
                lineHeight="1.7"
              >
                Building scalable web and mobile applications from concept to
                production. Leading technical teams, driving architecture
                decisions, and shipping reliable systems.
              </Text>

              {/* CTA + Socials */}
              <HStack spacing={3} flexWrap="wrap">
                <Box
                  as="button"
                  onClick={() => {
                    const section = document.getElementById("contact");
                    if (section) {
                      section.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  display="inline-flex"
                  alignItems="center"
                  gap={2}
                  px={5}
                  py={2.5}
                  border="1px solid"
                  borderColor={primaryColor}
                  borderRadius="lg"
                  color={primaryColor}
                  fontFamily={FontScheme.body}
                  fontSize="sm"
                  fontWeight="medium"
                  cursor="pointer"
                  transition="all 0.2s ease"
                  bg="transparent"
                  _hover={{
                    bg: secondaryColor,
                    transform: "translateY(-1px)",
                  }}
                >
                  <Icon as={BsChatDots} />
                  Discuss a Project
                </Box>

                {socials.map((social) => (
                  <Box
                    key={social.name}
                    as="a"
                    href={social.url}
                    target="_blank"
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                    w={10}
                    h={10}
                    border="1px solid"
                    borderColor={tagBorder}
                    borderRadius="lg"
                    color={textColor}
                    opacity={0.5}
                    transition="all 0.2s ease"
                    _hover={{
                      opacity: 1,
                      borderColor: primaryColor,
                      color: primaryColor,
                    }}
                  >
                    <Icon as={iconMap[social.icon]} fontSize="md" />
                  </Box>
                ))}
              </HStack>

              {/* Skill Tags */}
              <Wrap spacing={2} pt={1}>
                {skillTags.map((tag) => (
                  <WrapItem key={tag.label}>
                    <HStack
                      bg={tagBg}
                      border="1px solid"
                      borderColor={tagBorder}
                      borderRadius="full"
                      px={3}
                      py={1.5}
                      spacing={2}
                    >
                      <Icon
                        as={tag.icon}
                        fontSize="xs"
                        color={textColor}
                        opacity={0.6}
                      />
                      <Text
                        fontSize="xs"
                        fontFamily={FontScheme.body}
                        color={textColor}
                        opacity={0.7}
                        fontWeight="medium"
                      >
                        {tag.label}
                      </Text>
                    </HStack>
                  </WrapItem>
                ))}
              </Wrap>
            </Stack>
          </Box>
        </GridItem>

        {/* Right Side - Illustration */}
        <GridItem display={{ base: "none", lg: "flex" }} justifyContent="center" alignItems="center">
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            w="100%"
            maxW="420px"
          >
            <HeroIllustration primary={primaryColor} text={textColor} />
          </MotionBox>
        </GridItem>
      </Grid>
    </MotionBox>
  );
}
