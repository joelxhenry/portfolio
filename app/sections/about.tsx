import { Box, Button, Stack, useColorModeValue } from "@chakra-ui/react";
import Title from "../components/title";
import ColorScheme from "../assets/colors";
import aboutContent from "../content/about";
import { Content } from "./header";

export default function AboutMe() {
  return (
    <Stack alignItems={"flex-start"} textAlign={"left"}>
      <Title>about me.</Title>
      <Box py={10} display={"flex"} flexDirection={"column"} gap={5} maxW="700px">
        {aboutContent.paragraphs.map((paragraph, index) => (
          <Content key={index}>
            {paragraph}
          </Content>
        ))}
      </Box>

      <Button
        borderRadius="lg"
        as="a"
        href={`/${aboutContent.resumeFileName}`}
        download={aboutContent.resumeFileName}
        bg={useColorModeValue(ColorScheme.light.primary, ColorScheme.dark.primary)}
        color={useColorModeValue("white", "#0a0a0a")}
        fontWeight="medium"
        _hover={{
          opacity: 0.85,
        }}
      >
        Download Resume
      </Button>
    </Stack>
  );
}
