import ColorScheme from '../assets/colors'
import FontScheme from '../assets/fonts'
import Title from '../components/title'
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Stack,
  Text,
  useColorModeValue,
  Image,
} from '@chakra-ui/react'
import { NavButton, NavLink } from './navigation'
import { ArrowLeftIcon, ArrowDownIcon } from '@chakra-ui/icons'

interface ContentProps {
  children: React.ReactNode
}

export function Content({ children }: ContentProps) {
  return (
    <Text
      fontWeight={'medium'}
      opacity={0.6}
      fontSize={'16px'}
      fontFamily={FontScheme.body}
    >
      {children}
    </Text>
  )
}

export default function Header() {
  return (
    <>
      <Grid templateColumns="repeat(6, 1fr)" gap={5}>
        <GridItem h={'100%'} colSpan={{ base: 6, lg: 3 }}>
          <Stack h={'100%'} justifyContent={'space-around'}>
            <Stack
              spacing={1}
              color={useColorModeValue(
                ColorScheme.light.text,
                ColorScheme.dark.text,
              )}
            >
              <Title size="5xl">Joel Henry</Title>
              <Heading opacity={0.8} fontSize={'24px'} fontWeight={'medium'}>
                {'Software Developer'}
              </Heading>
              <Content>
                {
                  'I build reliable, accessible and responsive digital solutions for the web and mobile devices'
                }
              </Content>
            </Stack>

            <Stack direction={'row'} spacing={5}>
              <Box as="a" href="#" aspectRatio={'1/1'} width={8}>
                <Image w={'full'} src="/linkedin.png" alt="linkedin" />
              </Box>
              <Box
                borderRadius={'full'}
                as="a"
                href="#"
                aspectRatio={'1/1'}
                width={8}
              >
                <Image w={'full'} src="/github.png" alt="githubS" />
              </Box>
            </Stack>
            <Box mt={10}>
              <NavLink link="#projects">
                see my work{' '}
                <span>
                  <ArrowDownIcon />
                </span>
              </NavLink>
            </Box>
          </Stack>
        </GridItem>
        <GridItem colSpan={{ base: 6, lg: 3 }}>
          <Stack direction={'column'} spacing={2}></Stack>
        </GridItem>
      </Grid>
    </>
  )
}
