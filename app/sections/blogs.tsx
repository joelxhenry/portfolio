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
  const cardBg = useColorModeValue(
    ColorScheme.light.cardBg,
    ColorScheme.dark.cardBg
  );
  const borderColor = useColorModeValue(
    ColorScheme.light.cardBorder,
    ColorScheme.dark.cardBorder
  );
  const tagBg = useColorModeValue(
    "rgba(0,0,0,0.06)",
    "rgba(255,255,255,0.08)"
  );
  const tagColor = useColorModeValue(
    ColorScheme.light.text,
    ColorScheme.dark.text
  );

  return (
    <Card
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      overflow="hidden"
      backdropFilter="blur(20px)"
      _hover={{
        transform: "translateY(-4px)",
        borderColor: useColorModeValue(
          ColorScheme.light.primary,
          "rgba(200, 230, 78, 0.3)"
        ),
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
            <Text fontSize="sm" opacity={0.5} mb={3}>
              {new Date(blog.dateAdded).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })} - {blog.readTime} min read
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
                color={tagColor}
                opacity={0.8}
                borderRadius="full"
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
        bg={useColorModeValue(
          ColorScheme.light.primary,
          ColorScheme.dark.primary
        )}
        color={useColorModeValue("white", "#0a0a0a")}
        fontWeight="medium"
        borderRadius="lg"
        _hover={{
          opacity: 0.85,
        }}
        mt={4}
      >
        View All Blog Posts
      </Button>
    </Stack>
  );
}
