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
    <>
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
        fontWeight={"bold"}
        as={link ? "a" : "button"}
        {...(link ? { href: link } : {})}
      >
        {children}
      </Link>
    </>
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
    <>
      <Button
        _hover={{
          bg: useColorModeValue(
            ColorScheme.light.primary,
            ColorScheme.dark.primary
          ),
          color: useColorModeValue(
            ColorScheme.dark.text,
            ColorScheme.light.text
          ),
        }}
        borderRadius={"full"}
        px={10}
        onClick={handleClick}
        as={link ? "a" : "button"}
        {...(link ? { href: link } : {})}
      >
        {children}
      </Button>
    </>
  );
}

function NavDivider() {
  return (
    <>
      <Box
        color={useColorModeValue(ColorScheme.light.text, ColorScheme.dark.text)}
        mx={4}
        fontWeight={"bold"}
      >
        {"/"}
      </Box>
    </>
  );
}

const SideDrawer = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<any>();

  const handleClose = () => {
    onClose();
    // Prevent scroll-to-top by restoring focus without scrolling
    requestAnimationFrame(() => {
      btnRef.current?.focus({ preventScroll: true });
    });
  };

  return (
    <>
      {/* Trigger button */}
      <IconButton
        ref={btnRef}
        onClick={onOpen}
        aria-label="Menu"
        icon={<FaBars />}
        variant="ghost"
      />

      {/* Drawer */}
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
              <NavLink link="#">Blog</NavLink>
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
    <>
      <Box py={10} px={{ base: 5, md: 20, xl: 40 }}>
        <Flex alignItems={"center"} justifyContent={"space-between"}>
          <Box as={"a"} href="/">
            <Image
              maxW={10}
              src={colorMode === "light" ? "/logo_light.png" : "/logo_dark.png"}
              alt={colorMode === "light" ? "Light Logo" : "Dark Logo"}
            />
          </Box>
          <Stack alignItems={"center"} direction={"row"} spacing={5}>
            <Stack
              display={{ base: "none", lg: "flex" }}
              direction={"row"}
              spacing={5}
              divider={NavDivider()}
            >
              <NavLink scrollTo="about">about</NavLink>
              <NavLink scrollTo="projects">projects</NavLink>
              <NavLink link="#">blog</NavLink>
            </Stack>

            <Box display={{ base: "none", lg: "block" }}>
              <NavButton scrollTo="contact">get in touch</NavButton>
            </Box>

            <Button
              aspectRatio={"1/1"}
              borderRadius={"full"}
              size={"sm"}
              variant={"ghost"}
              onClick={toggleColorMode}
            >
              {" "}
              {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            </Button>

            <Box display={{ base: "block", lg: "none" }}>
              <SideDrawer />
            </Box>
          </Stack>
        </Flex>
      </Box>
    </>
  );
}
