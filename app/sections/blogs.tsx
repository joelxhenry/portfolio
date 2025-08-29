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
} from "@chakra-ui/react";
import Title from "../components/title";
import { Content } from "./header";
import blogs, { BlogInterface } from "../content/blogs";
import ColorScheme from "../assets/colors";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import Slider from "react-slick";

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

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    arrows: true,
    centerMode: true,
    centerPadding: "0px",
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          centerPadding: "20px",
        }
      }
    ]
  };

  return (
    <Stack alignItems="center" textAlign="center" spacing={8}>
      <Title>latest blogs.</Title>

      <Box py={6} width="100%" maxWidth="600px">
        <Box
          sx={{
            "& .slick-dots": {
              bottom: "-50px",
              "& li button:before": {
                color: useColorModeValue(ColorScheme.light.primary, ColorScheme.dark.primary),
                fontSize: "12px",
              },
              "& li.slick-active button:before": {
                color: useColorModeValue(ColorScheme.light.primary, ColorScheme.dark.primary),
              }
            },
            "& .slick-prev, & .slick-next": {
              "&:before": {
                color: useColorModeValue(ColorScheme.light.primary, ColorScheme.dark.primary),
                fontSize: "20px",
              },
              zIndex: 1,
            },
            "& .slick-prev": {
              left: "-25px",
            },
            "& .slick-next": {
              right: "-25px",
            }
          }}
        >
          <Slider {...sliderSettings}>
            {latestBlogs.map((blog, index) => (
              <Box key={index} px={2}>
                <BlogCard blog={blog} />
              </Box>
            ))}
          </Slider>
        </Box>
      </Box>

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