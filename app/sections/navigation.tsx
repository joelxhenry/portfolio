import {
  Box,
  Button,
  Flex,
  Stack,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  Image,
  HStack,
} from '@chakra-ui/react'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import ColorScheme from '../assets/colors'

interface NavLinkProps {
  children?: React.ReactNode
  link?: string
}

interface NavButtonProps {
  children?: React.ReactNode
  event?: () => any
  link?: string
}

export function NavLink(props: NavLinkProps) {
  const { children, link } = props
  return (
    <>
      <Box
        color={useColorModeValue(ColorScheme.light.text, ColorScheme.dark.text)}
        transition={'.25s ease'}
        _hover={{
          color: useColorModeValue(
            ColorScheme.light.primary,
            ColorScheme.dark.primary,
          ),
        }}
        fontWeight={'bold'}
        as="a"
        href={link ?? '#'}
      >
        {children}
      </Box>
    </>
  )
}

export function NavButton(props: NavButtonProps) {
  const { event, children, link } = props
  return (
    <>
      <Button
        _hover={{
          bg: useColorModeValue(
            ColorScheme.light.primary,
            ColorScheme.dark.primary,
          ),
          color: useColorModeValue(
            ColorScheme.dark.text,
            ColorScheme.light.text,
          ),
        }}
        borderRadius={'full'}
        px={10}
        onClick={event}
        as={link ? 'a' : 'button'}
        {...(link ? { href: link } : {})}
      >
        {children}
      </Button>
    </>
  )
}

function NavDivider() {
  return (
    <>
      <Box
        color={useColorModeValue(ColorScheme.light.text, ColorScheme.dark.text)}
        mr={4}
        fontWeight={'bold'}
      >
        ,
      </Box>
    </>
  )
}

export default function Navigation() {
  const { colorMode, toggleColorMode } = useColorMode()
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Box py={10} px={{ base: 10, md: 40, lg: 60 }}>
        <Flex alignItems={'center'} justifyContent={'space-between'}>
          <Box as={'a'} href="/">
            <Image
              maxW={10}
              src={colorMode === 'light' ? '/logo_light.png' : '/logo_dark.png'}
              alt={colorMode === 'light' ? 'Light Logo' : 'Dark Logo'}
            />
          </Box>
          <Stack alignItems={'center'} direction={'row'} spacing={7}>
            <Stack direction={'row'} spacing={5} divider={NavDivider()}>
              <NavLink link="#about">about</NavLink>
              <NavLink link="#projects">projects</NavLink>
            </Stack>

            <NavButton link="#contact">get in touch</NavButton>

            <Button
              aspectRatio={'1/1'}
              borderRadius={'full'}
              size={'sm'}
              variant={'ghost'}
              onClick={toggleColorMode}
            >
              {' '}
              {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            </Button>
          </Stack>
        </Flex>
      </Box>
    </>
  )
}
