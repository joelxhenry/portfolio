import Title from "../components/title";
import {
  Box,
  Image,
  Heading,
  Text,
  useColorModeValue,
  Wrap,
  WrapItem,
  Button,
  ButtonGroup,
  Stack,
  HStack,
} from "@chakra-ui/react";
import projects, { ProjectInterface } from "../content/projects";
import ColorScheme from "../assets/colors";
import FontScheme from "../assets/fonts";
import {
  BsCameraVideoFill,
  BsCodeSlash,
  BsPencilFill,
  BsPlayFill,
} from "react-icons/bs";
// Note: icons come from react-icons (deterministic SVG) rather than
// @icon-park/react, whose random clipPath IDs caused SSR hydration
// mismatches under Next.js. Keep new icons on react-icons too.

// Converts a YouTube or Loom share URL into its embeddable player URL.
// Returns null for anything unrecognized so the card falls back to a plain
// "Watch demo" link button instead of embedding an untrusted iframe src.
function toEmbedUrl(url: string): string | null {
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;

  const loom = url.match(/loom\.com\/(?:share|embed)\/([\w-]+)/);
  if (loom) return `https://www.loom.com/embed/${loom[1]}`;

  return null;
}

function StackTag({ label }: { label: string }) {
  return (
    <WrapItem>
      <Box
        textTransform={"uppercase"}
        whiteSpace={"nowrap"}
        fontSize={"10px"}
        fontWeight={"bold"}
        py={"2px"}
        px={3}
        borderRadius={"full"}
        color={useColorModeValue(ColorScheme.light.text, ColorScheme.dark.text)}
        bg={useColorModeValue(
          ColorScheme.light.secondary,
          ColorScheme.dark.secondary
        )}
      >
        {label}
      </Box>
    </WrapItem>
  );
}

function ProjectCard({ project }: { project: ProjectInterface }) {
  const cardBg = useColorModeValue(
    ColorScheme.light.cardBg,
    ColorScheme.dark.cardBg
  );
  const cardBorder = useColorModeValue(
    ColorScheme.light.cardBorder,
    ColorScheme.dark.cardBorder
  );
  const primary = useColorModeValue(
    ColorScheme.light.primary,
    ColorScheme.dark.primary
  );

  // Descriptions may contain a blank-line-separated aside (e.g. the demo
  // credentials on Harmon). Render each block as its own paragraph so the
  // structure survives instead of collapsing into one run of text.
  const paragraphs = project.description
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const videoEmbed = project.video_link ? toEmbedUrl(project.video_link) : null;

  return (
    <Stack
      as="article"
      bg={cardBg}
      border="1px solid"
      borderColor={cardBorder}
      borderRadius="2xl"
      p={{ base: 5, md: 6 }}
      spacing={4}
      transition="ease .25s"
      _hover={{ borderColor: primary }}
    >
      {/* Header — fixed-size brand mark beside the project name. White backdrop
          keeps a dark logo legible in both themes; contain never distorts it. */}
      <HStack spacing={3} align="center">
        <Box
          flexShrink={0}
          boxSize={{ base: "44px", md: "52px" }}
          bg="white"
          borderRadius="lg"
          p={2}
          border="1px solid"
          borderColor={cardBorder}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Image
            src={project.image}
            alt={`${project.title} logo`}
            maxW="full"
            maxH="full"
            objectFit="contain"
          />
        </Box>
        <Heading fontSize={{ base: "lg", md: "xl" }} color={primary}>
          {project.title}
        </Heading>
      </HStack>

      <Stack spacing={2}>
        {paragraphs.map((block, i) => (
          <Text
            key={i}
            fontFamily={FontScheme.body}
            fontSize={"15px"}
            opacity={i === 0 ? 0.85 : 0.6}
          >
            {block}
          </Text>
        ))}
      </Stack>

      {videoEmbed && (
        <Box
          position="relative"
          width="full"
          maxW={{ base: "full", md: "640px" }}
          alignSelf="flex-start"
          borderRadius="lg"
          overflow="hidden"
          border="1px solid"
          borderColor={cardBorder}
          sx={{ aspectRatio: "16 / 9" }}
        >
          <Box
            as="iframe"
            src={videoEmbed}
            title={`${project.title} demo video`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            position="absolute"
            top={0}
            left={0}
            width="full"
            height="full"
            border="0"
          />
        </Box>
      )}

      <Wrap spacing={2}>
        {project.stack.map((tool, i) => (
          <StackTag label={tool} key={i} />
        ))}
      </Wrap>

      <ButtonGroup flexWrap="wrap" gap={2} spacing={0} pt={1}>
        {project.preview_link && (
          <Button
            href={project.preview_link}
            target="_blank"
            as="a"
            rounded="lg"
            size="sm"
            rightIcon={<BsPlayFill />}
          >
            Preview
          </Button>
        )}
        {/* Only show a link button when the video can't be embedded above —
            otherwise the inline player already covers it. */}
        {project.video_link && !videoEmbed && (
          <Button
            href={project.video_link}
            target="_blank"
            as="a"
            rounded="lg"
            size="sm"
            variant="ghost"
            rightIcon={<BsCameraVideoFill />}
          >
            Watch demo
          </Button>
        )}
        {project.source_code_link && (
          <Button
            href={project.source_code_link}
            as="a"
            target="_blank"
            rounded="lg"
            size="sm"
            variant="ghost"
            rightIcon={<BsCodeSlash />}
          >
            Source Code
          </Button>
        )}
        {project.blog_link && (
          <Button
            href={project.blog_link}
            as="a"
            target="_blank"
            rounded="lg"
            size="sm"
            variant="ghost"
            rightIcon={<BsPencilFill />}
          >
            Read Post
          </Button>
        )}
      </ButtonGroup>
    </Stack>
  );
}

export default function Projects() {
  return (
    <Box as="section" aria-label="Projects">
      <Title>my work.</Title>

      <Stack mt={10} spacing={{ base: 5, md: 6 }}>
        {projects.map((project, i) => (
          <ProjectCard project={project} key={i} />
        ))}
      </Stack>
    </Box>
  );
}
