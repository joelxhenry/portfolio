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
        py={20}
        w={"full"}
        borderRadius="md"
        bg={useColorModeValue(ColorScheme.light.bg, ColorScheme.dark.bg)}
        boxShadow="lg"
      >
        <VStack spacing={4} maxW={{ base: "full", md: "lg" }}>
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Message</FormLabel>
            <Textarea
              name="message"
              placeholder="Your message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
            />
          </FormControl>

          <Button 
            type="submit" 
            width="full"
            isLoading={isSubmitting}
            loadingText="Sending..."
            bg={useColorModeValue(ColorScheme.light.primary, ColorScheme.dark.primary)}
            color="white"
            _hover={{
              opacity: 0.9,
            }}
          >
            Send Message
          </Button>
        </VStack>
      </Box>
    </Stack>
  );
}
