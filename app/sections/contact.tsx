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

  const handleChange = (e: any) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Send form data logic here
    console.log("Form Submitted:", formData);
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

          <Button type="submit" width="full">
            Send Message
          </Button>
        </VStack>
      </Box>
    </Stack>
  );
}
