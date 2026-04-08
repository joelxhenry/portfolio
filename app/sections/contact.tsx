import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Textarea,
  useColorModeValue,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import Title from "../components/title";
import ColorScheme from "../assets/colors";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleChange = (e: any) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Message sent!",
          description: "Thank you for your message. I'll get back to you soon!",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setFormData({ name: "", email: "", message: "" });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
    } catch (error) {
      toast({
        title: "Error sending message",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = {
    bg: useColorModeValue("rgba(0,0,0,0.02)", "rgba(255,255,255,0.04)"),
    border: "1px solid",
    borderColor: useColorModeValue(
      ColorScheme.light.cardBorder,
      ColorScheme.dark.cardBorder
    ),
    _focus: {
      borderColor: useColorModeValue(
        ColorScheme.light.primary,
        ColorScheme.dark.primary
      ),
      boxShadow: "none",
    },
  };

  return (
    <Stack spacing={10} w={"full"}>
      <Box display={"flex"} justifyContent={"center"}>
        <Title>get in touch.</Title>
      </Box>

      <Box
        as="form"
        onSubmit={handleSubmit}
        display={"flex"}
        justifyContent={"center"}
        py={12}
        px={{ base: 6, md: 12 }}
        w={"full"}
        borderRadius="2xl"
        bg={useColorModeValue(
          ColorScheme.light.cardBg,
          ColorScheme.dark.cardBg
        )}
        border="1px solid"
        borderColor={useColorModeValue(
          ColorScheme.light.cardBorder,
          ColorScheme.dark.cardBorder
        )}
        backdropFilter="blur(20px)"
      >
        <VStack spacing={4} maxW={{ base: "full", md: "lg" }} w="full">
          <FormControl isRequired>
            <FormLabel fontSize="sm" opacity={0.7}>Name</FormLabel>
            <Input
              type="text"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              {...inputStyles}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontSize="sm" opacity={0.7}>Email</FormLabel>
            <Input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              {...inputStyles}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontSize="sm" opacity={0.7}>Message</FormLabel>
            <Textarea
              name="message"
              placeholder="Your message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              {...inputStyles}
            />
          </FormControl>

          <Button
            type="submit"
            width="full"
            isLoading={isSubmitting}
            loadingText="Sending..."
            bg={useColorModeValue(
              ColorScheme.light.primary,
              ColorScheme.dark.primary
            )}
            color={useColorModeValue("white", "#0a0a0a")}
            fontWeight="medium"
            _hover={{
              opacity: 0.85,
            }}
          >
            Send Message
          </Button>
        </VStack>
      </Box>
    </Stack>
  );
}
