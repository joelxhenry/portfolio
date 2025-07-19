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
} from "@chakra-ui/react";
import { NavLink } from "./navigation";
import { ArrowDownIcon } from "@chakra-ui/icons";
import { FaLinkedin, FaGithub } from "react-icons/fa";

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

export default function Header() {
  return (
    <>
      <Stack
        h={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
        textAlign={"center"}
      >
        <Stack
          padding={5}
          borderRadius={10}
          boxShadow={"0 0 10px rgba(0, 0, 0, 0.1)"}
          backdropFilter={"blur(10px)"}
          backgroundColor={useColorModeValue(
            ColorScheme.light.bg,
            ColorScheme.dark.bg
          )}
          justifyContent={"center"}
          alignItems={"center"}
          spacing={1}
          color={useColorModeValue(
            ColorScheme.light.text,
            ColorScheme.dark.text
          )}
        >
          <Title size="5xl">Joel Henry</Title>
          <Heading opacity={0.8} fontSize={"18px"} fontWeight={"medium"}>
            {"DevOps Engineer | Software Developer"}
          </Heading>
        </Stack>

        <Stack direction={"row"} spacing={5}>
          <IconButton
            as="a"
            href="#"
            aria-label="LinkedIn"
            icon={<FaLinkedin />}
            variant="ghost"
          />
          <IconButton
            as="a"
            href="#"
            aria-label="Github"
            icon={<FaGithub />}
            variant="ghost"
          />
        </Stack>
        <Box mt={10}>
          <NavLink scrollTo="projects">
            see my work{" "}
            <span>
              <ArrowDownIcon />
            </span>
          </NavLink>
        </Box>
      </Stack>
    </>
  );
}
