import ColorScheme from "../assets/colors";
import FontScheme from "../assets/fonts";
import Title from "../components/title";
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Stack,
  Text,
  useColorModeValue,
  IconButton,
  keyframes,
} from "@chakra-ui/react";
import { ArrowDownIcon } from "@chakra-ui/icons";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";

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

const float = keyframes`
  0%, 100% { transform: translateY(0px) }
  50% { transform: translateY(-10px) }
`;

const MotionBox = motion(Box);
const MotionStack = motion(Stack);

export default function Header() {
  return (
    <>
      <Stack
        h={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
        textAlign={"center"}
        spacing={8}
      >
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Stack
            padding={{ base: 8, md: 12 }}
            borderRadius={10}
            boxShadow={"0 0 20px rgba(0, 0, 0, 0.1)"}
            backdropFilter={"blur(10px)"}
            backgroundColor={useColorModeValue(
              ColorScheme.light.bg,
              ColorScheme.dark.bg
            )}
            justifyContent={"center"}
            alignItems={"center"}
            spacing={6}
            position="relative"
            border="1px solid"
            borderColor={useColorModeValue("rgba(0,0,0,0.05)", "rgba(255,255,255,0.1)")}
          >
            <Box position="relative" textAlign="center">
              <Text
                fontSize={{ base: "5xl", md: "6xl", lg: "7xl" }}
                fontWeight="bold"
                fontFamily={FontScheme.title}
                color={useColorModeValue(
                  ColorScheme.light.text,
                  ColorScheme.dark.text
                )}
                lineHeight="1"
                letterSpacing="-0.02em"
              >
                Joel Henry
              </Text>
              <Box
                w="60%"
                mx="auto"
                mt={2}
                h="4px"
                bg={useColorModeValue(ColorScheme.light.primary, ColorScheme.dark.primary)}
                borderRadius="2px"
              />
            </Box>
            
            <Heading 
              fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
              fontWeight="medium"
              opacity={0.8}
              fontFamily={FontScheme.body}
              color={useColorModeValue(
                ColorScheme.light.text,
                ColorScheme.dark.text
              )}
              letterSpacing="0.5px"
            >
              Software Developer
            </Heading>
          </Stack>
        </MotionBox>

        <MotionStack 
          direction={"row"} 
          spacing={6}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <IconButton
            as="a"
            href="#"
            aria-label="LinkedIn"
            icon={<FaLinkedin />}
            variant="ghost"
            size="lg"
            borderRadius="md"
            _hover={{
              transform: "translateY(-2px)",
              color: useColorModeValue(ColorScheme.light.primary, ColorScheme.dark.primary),
              bg: useColorModeValue("rgba(0,0,0,0.05)", "rgba(255,255,255,0.1)"),
            }}
            transition="all 0.2s ease"
          />
          <IconButton
            as="a"
            href="#"
            aria-label="Github"
            icon={<FaGithub />}
            variant="ghost"
            size="lg"
            borderRadius="md"
            _hover={{
              transform: "translateY(-2px)",
              color: useColorModeValue(ColorScheme.light.primary, ColorScheme.dark.primary),
              bg: useColorModeValue("rgba(0,0,0,0.05)", "rgba(255,255,255,0.1)"),
            }}
            transition="all 0.2s ease"
          />
        </MotionStack>

        <MotionBox 
          mt={4}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Box
            as="button"
            onClick={() => {
              const section = document.getElementById("projects");
              if (section) {
                section.scrollIntoView({ behavior: "smooth" });
              }
            }}
            padding="12px 32px"
            borderRadius={0}
            bg={useColorModeValue(ColorScheme.light.primary, ColorScheme.dark.primary)}
            color="white"
            fontWeight="medium"
            fontSize="md"
            fontFamily={FontScheme.body}
            cursor="pointer"
            transition="all 0.2s ease"
            _hover={{
              transform: "translateY(-1px)",
              shadow: "md",
              opacity: 0.9,
            }}
            _active={{
              transform: "translateY(0px)",
            }}
          >
            <Text as="span" mr={2}>
              see my work
            </Text>
            <ArrowDownIcon />
          </Box>
        </MotionBox>
      </Stack>
    </>
  );
}
