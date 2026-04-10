"use client";

import { useColorModeValue, Box, useColorMode } from "@chakra-ui/react";
import Navigation from "./sections/navigation";
import Header from "./sections/header";
import AnimatedCursor from "react-animated-cursor";
import Container from "./components/container";
import Projects from "./sections/projects";
import React from "react";
import ColorScheme from "./assets/colors";
import FontSchema from "./assets/fonts";
import hexRgb from "hex-rgb";
import AboutMe from "./sections/about";
import Skills from "./sections/skills";
import ContactForm from "./sections/contact";
import Footer from "./sections/footer";
import BotLauncher from "./sections/bot-launcher";

export default function Home() {
  const { colorMode } = useColorMode();

  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    setLoaded(true);
  }, []);
  return (
    <Box
      className={"animated-gradient " + useColorModeValue("light", "dark")}
      fontFamily={FontSchema.body}
      color={useColorModeValue(ColorScheme.light.text, ColorScheme.dark.text)}
    >
      <Box position={"relative"}>
        <Navigation />
        <Box
          py={{ base: 6, md: 10, xl: 14 }}
          px={{ base: 5, md: 10, xl: 20 }}
          maxW="1400px"
          mx="auto"
        >
          <Header />
        </Box>
      </Box>

      <Container id="about" group={true}>
        <Box pt={10}>
          <AboutMe />
        </Box>
      </Container>

      <Skills />

      <Container id="projects" group={true}>
        <Box>
          <Projects />
        </Box>
      </Container>

      <Container id="contact" group={true}>
        <Box py={10}>
          <ContactForm />
        </Box>
      </Container>

      <Footer />

      {/* BotLauncher is headless now — it renders only the Modal dialog
          and a window-event listener for OPEN_BOT_EVENT, which the About
          section dispatches from its animated AI advocate button. */}
      <BotLauncher />

      {loaded ? (
        <AnimatedCursor
          innerSize={8}
          outerSize={40}
          color={
            colorMode === "light"
              ? hexRgb(ColorScheme.light.primary, { format: "array" })
                  .slice(0, -1)
                  .join(", ")
              : hexRgb(ColorScheme.dark.primary, { format: "array" })
                  .slice(0, -1)
                  .join(", ")
          }
          outerAlpha={0.1}
          innerScale={1}
          outerScale={5}
          trailingSpeed={3}
          innerStyle={{ zIndex: 9999 }}
          outerStyle={{ zIndex: 9999 }}
        />
      ) : (
        <></>
      )}
    </Box>
  );
}
