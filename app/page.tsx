'use client'

import { useColorModeValue, Box, useColorMode } from '@chakra-ui/react'
import Navigation from './sections/navigation'
import Header from './sections/header'
import AnimatedCursor from 'react-animated-cursor'
import Container from './components/container'
import Experience from './sections/experience'
import Projects from './sections/projects'
import React from 'react'

export default function Home() {
  const { colorMode } = useColorMode()

  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    setLoaded(true)
  }, [])
  return (
    <Box
      minH={'100vh'}
      bg={useColorModeValue(
        'linear-gradient(45deg, rgba(249,252,248,1) 0%, rgba(240,240,240,1) 50%, rgba(250,250,250,1) 100%)',
        'linear-gradient(45deg, rgba(40,41,48,1) 0%, rgba(53,54,61,1) 50%, rgba(52,53,62,1) 100%)',
      )}
    >
      {loaded ? (
        <AnimatedCursor
          innerSize={8}
          outerSize={40}
          color={colorMode === 'light' ? '71,122,98' : '174,213,131'}
          outerAlpha={0.1}
          innerScale={1}
          outerScale={5}
          trailingSpeed={3}
        />
      ) : (
        <></>
      )}

      <Navigation />

      <Container id="about" group={true}>
        <Header />
      </Container>

      <Container id="experience" group={true}>
        <Experience />
      </Container>

      <Container id="projects" group={true}>
        <Projects />
      </Container>
    </Box>
  )
}
