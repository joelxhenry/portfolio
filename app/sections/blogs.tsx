import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Stack,
  Text,
  Tag,
  HStack,
  useColorModeValue,
  Link,
  SimpleGrid,
} from "@chakra-ui/react";
import Title from "../components/title";
import { Content } from "./header";
import blogs, { BlogInterface } from "../content/blogs";
import ColorScheme from "../assets/colors";
import { ExternalLinkIcon } from "@chakra-ui/icons";

interface BlogCardProps {
  blog: BlogInterface;
}

function BlogCard({ blog }: BlogCardProps) {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const tagBg = useColorModeValue(ColorScheme.light.primary, ColorScheme.dark.primary);

  return (
    <Card
      bg={cardBg}
      border="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      _hover={{
        transform: "translateY(-4px)",
        shadow: "lg",
      }}
      transition="all 0.2s"
      cursor="pointer"
      as={Link}
      href={`https://console-logs.hashnode.dev/${blog.slug}`}
      isExternal
      textDecoration="none !important"
    >
      <CardBody>
        <Stack spacing={4}>
          <Box>
            <Heading size="md" mb={2} noOfLines={2}>
              {blog.title}
            </Heading>
            <Text fontSize="sm" color="gray.500" mb={3}>
              {new Date(blog.dateAdded).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })} • {blog.readTime} min read
            </Text>
            <Content>
              <Text noOfLines={3}>{blog.brief}</Text>
            </Content>
          </Box>
          <HStack spacing={2} flexWrap="wrap">
            {blog.tags.slice(0, 3).map((tag, index) => (
              <Tag
                key={index}
                size="sm"
                bg={tagBg}
                color="white"
                opacity={0.9}
              >
                {tag}
              </Tag>
            ))}
          </HStack>
        </Stack>
      </CardBody>
    </Card>
  );
}

export default function BlogSection() {
  const latestBlogs = blogs.slice(0, 3);


  return (
    <Stack alignItems="center" textAlign="center" spacing={8}>
      <Title>latest blogs.</Title>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} width="100%" maxWidth="1200px">
        {latestBlogs.map((blog, index) => (
          <BlogCard key={index} blog={blog} />
        ))}
      </SimpleGrid>

      <Button
        as={Link}
        href="https://console-logs.hashnode.dev/?source=top_nav_blog_home"
        isExternal
        rightIcon={<ExternalLinkIcon />}
        rounded={0}
        textAlign="center"
        bg={useColorModeValue(ColorScheme.light.primary, ColorScheme.dark.primary)}
        color="white"
        _hover={{
          opacity: 0.9,
        }}
        mt={8}
      >
        View All Blog Posts
      </Button>
    </Stack>
  );
}