'use client'

import { useColorModeValue, Box, useColorMode } from '@chakra-ui/react'
import Navigation from './sections/navigation'
import Header, { Content } from './sections/header'
import AnimatedCursor from 'react-animated-cursor'
import Container from './components/container'
import Experience from './sections/experience'
import Projects from './sections/projects'
import React from 'react'
import ColorScheme from './assets/colors'
import FontSchema from './assets/fonts'
import hexRgb from 'hex-rgb'
import Title from './components/title'
import AboutMe from './sections/about'
import Skills from './sections/skills'

export default function Home() {
  const { colorMode } = useColorMode()

  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    setLoaded(true)
  }, [])
  return (
    <Box
      minH={'100vh'}
      fontFamily={FontSchema.body}
      color={useColorModeValue(ColorScheme.light.text, ColorScheme.dark.text)}
      bg={useColorModeValue(ColorScheme.light.main, ColorScheme.dark.main)}
      bgAttachment={'fixed'}
    >
      {loaded ? (
        <AnimatedCursor
          innerSize={8}
          outerSize={40}
          color={
            colorMode === 'light'
              ? hexRgb(ColorScheme.light.primary, { format: 'array' })
                  .slice(0, -1)
                  .join(', ')
              : hexRgb(ColorScheme.dark.primary, { format: 'array' })
                  .slice(0, -1)
                  .join(', ')
          }
          outerAlpha={0.1}
          innerScale={1}
          outerScale={5}
          trailingSpeed={3}
        />
      ) : (
        <></>
      )}

      <Navigation />

      <Container group={true}>
        <Header />
      </Container>

      <Container id="about" group={true}>
        <AboutMe />
      </Container>

      <Container id="experience" group={true}>
        <Experience />
      </Container>

      <Container id="projects" group={true}>
        <Projects />
      </Container>

      <Skills />
    </Box>
  )
}
