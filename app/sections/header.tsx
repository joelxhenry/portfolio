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
      <Grid templateColumns="repeat(6, 1fr)" gap={5}>
        <GridItem h={"100%"} colSpan={{ base: 6, lg: 3 }}>
          <Stack h={"100%"} justifyContent={"space-around"}>
            <Stack
              spacing={1}
              color={useColorModeValue(
                ColorScheme.light.text,
                ColorScheme.dark.text
              )}
            >
              <Title size="5xl">Joel Henry</Title>
              <Heading opacity={0.8} fontSize={"24px"} fontWeight={"medium"}>
                {"Software Developer"}
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
        </GridItem>
        <GridItem colSpan={{ base: 6, lg: 3 }}>
          <Stack direction={"column"} spacing={2}></Stack>
        </GridItem>
      </Grid>
    </>
  );
}
