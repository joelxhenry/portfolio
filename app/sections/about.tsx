"use client";

import {
  Box,
  Button,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { BsArrowRight, BsFileEarmarkText } from "react-icons/bs";

import ColorScheme from "../assets/colors";
import FontScheme from "../assets/fonts";
import aboutContent from "../content/about";
import Title from "../components/title";

export default function AboutMe() {
  const textColor = useColorModeValue(
    ColorScheme.light.text,
    ColorScheme.dark.text,
  );

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

      <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
        <Button
          as="a"
          href={`/${aboutContent.resumeFileName}`}
          target="_blank"
          rounded="lg"
          leftIcon={<BsFileEarmarkText />}
        >
          View résumé
        </Button>
        <Button
          as="a"
          href="#contact"
          rounded="lg"
          variant="ghost"
          rightIcon={<BsArrowRight />}
        >
          Get in touch
        </Button>
      </Stack>
    </Stack>
  );
}
