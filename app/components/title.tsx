import React from 'react'
import { Box, useColorModeValue } from '@chakra-ui/react'

interface TitleProps {
  children: React.ReactNode
  size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
}

export default function Title({ children, size }: TitleProps) {
  return (
    <>
      <Box
        color={useColorModeValue('#282930', '#f9fcf8')}
        fontSize={size ?? '2xl'}
        fontWeight={'bold'}
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
            '4px solid #31ac74',
            '4px solid #aed583',
          )}
        ></Box>
      </Box>
    </>
  )
}
