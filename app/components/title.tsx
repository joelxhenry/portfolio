import React from 'react'
import { Box, useColorModeValue } from '@chakra-ui/react'
import ColorScheme from '../assets/colors'
import FontScheme from '../assets/fonts'

interface TitleProps {
  children: React.ReactNode
  size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
}

export default function Title({ children, size }: TitleProps) {
  return (
    <>
      <Box
        color={useColorModeValue(ColorScheme.light.text, ColorScheme.dark.text)}
        fontSize={size ?? '2xl'}
        fontWeight={'bold'}
        fontFamily={FontScheme.title}
        w={'fit-content'}
      >
        {children}
        <Box
          w={'25%'}
          transition={'.5s ease'}
          _groupHover={{
            w: '100%',
          }}
          borderBottom={useColorModeValue(
            `4px solid ${ColorScheme.light.primary}`,
            `4px solid ${ColorScheme.dark.primary}`,
          )}
        ></Box>
      </Box>
    </>
  )
}
