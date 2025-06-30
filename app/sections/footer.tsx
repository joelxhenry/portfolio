import { Box, Flex, Text, Stack, IconButton } from "@chakra-ui/react";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <Box py={10}>
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align="center"
        maxW="6xl"
        mx="auto"
        px={6}
        gap={6}
      >
        <Text  textAlign="center" fontSize="sm">
          &copy; {new Date().getFullYear()} Joel Henry Portfolio. All rights
          reserved.
        </Text>

        {/* Social Icons */}
        <Stack direction="row" spacing={4}>
          <IconButton
            as="a"
            href="#"
            aria-label="Facebook"
            icon={<FaGithub />}
            variant="ghost"
          />
          <IconButton
            as="a"
            href="#"
            aria-label="Twitter"
            icon={<FaTwitter />}
            variant="ghost"
          />
          <IconButton
            as="a"
            href="#"
            aria-label="Instagram"
            icon={<FaLinkedin />}
            variant="ghost"
          />
        </Stack>
      </Flex>
    </Box>
  );
};

export default Footer;
