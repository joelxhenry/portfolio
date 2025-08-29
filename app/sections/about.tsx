import { Box, Button, Stack, useColorModeValue } from "@chakra-ui/react";
import Title from "../components/title";
import ColorScheme from "../assets/colors";
import aboutContent from "../content/about";
import { Content } from "./header";

export default function AboutMe() {
  return (
    <Stack alignItems={"center"} textAlign={"center"}>
      <Title>about me.</Title>
      <Box py={10} display={"flex"} flexDirection={"column"} gap={5}>
        {aboutContent.paragraphs.map((paragraph, index) => (
          <Content key={index}>
            {paragraph}
          </Content>
        ))}
      </Box>

      <Button 
        rounded={0} 
        textAlign={"end"}
        as="a"
        href={`/${aboutContent.resumeFileName}`}
        download={aboutContent.resumeFileName}
        bg={useColorModeValue(ColorScheme.light.primary, ColorScheme.dark.primary)}
        color="white"
        _hover={{
          opacity: 0.9,
        }}
      >
        Download Resume
      </Button>
    </Stack>
  );
}
