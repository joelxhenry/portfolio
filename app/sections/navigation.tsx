import {
  Box,
  Button,
  Flex,
  Stack,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  Image,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  VStack,
  IconButton,
  DrawerFooter,
  Link,
  HStack,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import ColorScheme from "../assets/colors";
import { useRef } from "react";
import { FaBars } from "react-icons/fa";

interface NavLinkProps {
  children?: React.ReactNode;
  link?: string;
  scrollTo?: string;
  event?: () => any;
}

interface NavButtonProps {
  children?: React.ReactNode;
  event?: () => any;
  link?: string;
  scrollTo?: string;
}

export function NavLink(props: NavLinkProps) {
  const { children, link, scrollTo, event } = props;

  const handleClick = (e: any) => {
    if (scrollTo) {
      e.preventDefault();
      const section = document.getElementById(scrollTo);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }

    if (event) event();
  };

  return (
    <Link
      onClick={handleClick}
      color={useColorModeValue(ColorScheme.light.text, ColorScheme.dark.text)}
      transition={".25s ease"}
      _hover={{
        color: useColorModeValue(
          ColorScheme.light.primary,
          ColorScheme.dark.primary
        ),
      }}
      fontWeight={"medium"}
      fontSize={"sm"}
      as={link ? "a" : "button"}
      {...(link ? { href: link } : {})}
    >
      {children}
    </Link>
  );
}

export function NavButton(props: NavButtonProps) {
  const { children, link, scrollTo, event } = props;

  const handleClick = (e: any) => {
    if (scrollTo) {
      e.preventDefault();
      const section = document.getElementById(scrollTo);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }

    if (event) event();
  };
  return (
    <Button
      bg={useColorModeValue(ColorScheme.light.primary, ColorScheme.dark.primary)}
      color={useColorModeValue("white", "#0a0a0a")}
      _hover={{
        opacity: 0.85,
      }}
      borderRadius={"full"}
      px={6}
      size={"sm"}
      fontWeight={"medium"}
      onClick={handleClick}
      as={link ? "a" : "button"}
      {...(link ? { href: link } : {})}
    >
      {children}
    </Button>
  );
}

const SideDrawer = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<any>();

  const handleClose = () => {
    onClose();
    requestAnimationFrame(() => {
      btnRef.current?.focus({ preventScroll: true });
    });
  };

  return (
    <>
      <IconButton
        ref={btnRef}
        onClick={onOpen}
        aria-label="Menu"
        icon={<FaBars />}
        variant="ghost"
        size="sm"
      />

      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
      >
        <DrawerOverlay />
        <DrawerContent
          bg={useColorModeValue(ColorScheme.light.bg, ColorScheme.dark.bg)}
        >
          <DrawerBody>
            <VStack mt={10} align="start" spacing={5}>
              <NavLink scrollTo="about" event={handleClose}>
                About
              </NavLink>
              <NavLink scrollTo="projects" event={handleClose}>
                Projects
              </NavLink>
            </VStack>
          </DrawerBody>

          <DrawerFooter>
            <NavButton scrollTo="contact" event={handleClose}>
              Get In Touch
            </NavButton>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default function Navigation() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box
      py={4}
      px={{ base: 5, md: 10, xl: 20 }}
    >
      <Flex
        alignItems={"center"}
        justifyContent={"space-between"}
        bg={useColorModeValue(ColorScheme.light.cardBg, ColorScheme.dark.cardBg)}
        border={"1px solid"}
        borderColor={useColorModeValue(
          ColorScheme.light.cardBorder,
          ColorScheme.dark.cardBorder
        )}
        borderRadius={"xl"}
        backdropFilter={"blur(20px)"}
        px={6}
        py={3}
      >
        {/* Logo */}
        <Box as="a" href="/" display="flex" alignItems="center">
          <Image
            src={colorMode === "light" ? "/logo_light.png" : "/logo_dark.png"}
            alt="Joel Henry Logo"
            maxH="28px"
            objectFit="contain"
          />
        </Box>

        {/* Center nav links */}
        <HStack
          display={{ base: "none", lg: "flex" }}
          spacing={8}
        >
          <NavLink scrollTo="about">About</NavLink>
          <NavLink scrollTo="projects">Projects</NavLink>
        </HStack>

        {/* Right side actions */}
        <HStack spacing={3}>
          <Box display={{ base: "none", lg: "block" }}>
            <NavButton scrollTo="contact">Get In Touch</NavButton>
          </Box>

          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            variant="ghost"
            size="sm"
            borderRadius="full"
            onClick={toggleColorMode}
          />

          <Box display={{ base: "block", lg: "none" }}>
            <SideDrawer />
          </Box>
        </HStack>
      </Flex>
    </Box>
  );
}
