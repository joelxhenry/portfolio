import { Box, Flex, Text, Stack, IconButton, useColorModeValue, useColorMode, Image } from "@chakra-ui/react";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import ColorScheme from "../assets/colors";
import { socials } from "../config/socials";

const iconMap: Record<string, any> = {
  FaGithub,
  FaLinkedin,
  FaTwitter,
};

const Footer = () => {
  const { colorMode } = useColorMode();
  const hoverColor = useColorModeValue(
    ColorScheme.light.primary,
    ColorScheme.dark.primary
  );

  return (
    <Box
      py={10}
      borderTop="1px solid"
      borderColor={useColorModeValue(
        ColorScheme.light.cardBorder,
        ColorScheme.dark.cardBorder
      )}
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align="center"
        maxW="6xl"
        mx="auto"
        px={6}
        gap={6}
      >
        <Flex align="center" gap={3}>
          <Image
            src={colorMode === "light" ? "/logo_light.png" : "/logo_dark.png"}
            alt="Joel Henry Logo"
            maxH="20px"
            objectFit="contain"
          />
          <Text fontSize="sm" opacity={0.5}>
            &copy; {new Date().getFullYear()} Joel Henry
          </Text>
        </Flex>

        <Stack direction="row" spacing={2}>
          {socials.map((social) => (
            <IconButton
              key={social.name}
              as="a"
              href={social.url}
              target="_blank"
              aria-label={social.ariaLabel}
              icon={iconMap[social.icon] ? <Box as={iconMap[social.icon]} /> : undefined}
              variant="ghost"
              size="sm"
              borderRadius="full"
              _hover={{
                color: hoverColor,
              }}
            />
          ))}
        </Stack>
      </Flex>
    </Box>
  );
};

export default Footer;
