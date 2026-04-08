import Title from "../components/title";
import {
  Box,
  Image,
  Heading,
  useColorModeValue,
  HStack,
  Button,
  List,
  ListIcon,
  SimpleGrid,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useBreakpointValue,
  PlacementWithLogical,
  Stack,
} from "@chakra-ui/react";
import projects, { ProjectInterface } from "../content/projects";
import ColorScheme from "../assets/colors";
import { Content } from "./header";
import { ArrowRight, Code, PlayOne,  Pencil } from "@icon-park/react";

function Project({ project }: { project: ProjectInterface }) {
  const placement = useBreakpointValue<PlacementWithLogical>({
    base: "bottom",
    lg: "right",
  });

  const trigger = useBreakpointValue<any>({
    base: undefined,
    lg: "hover",
  });

  const cardBg = useColorModeValue(
    ColorScheme.light.cardBg,
    ColorScheme.dark.cardBg
  );
  const cardBorder = useColorModeValue(
    ColorScheme.light.cardBorder,
    ColorScheme.dark.cardBorder
  );

  return (
    <Stack
      flexDirection={"row"}
      spacing={3}
      width={{ base: "full", lg: "75%" }}
    >
      <Box
        position={"relative"}
        display={{ base: "none", md: "flex" }}
        alignItems={"center"}
        justifyContent={"center"}
        aspectRatio={1}
        overflow={"hidden"}
        width={"25%"}
        rounded={12}
        border="1px solid"
        borderColor={cardBorder}
      >
        <Image width={"full"} src={project.image} alt={project.title} />
      </Box>
      <Popover trigger={trigger} placement={placement}>
        <PopoverTrigger>
          <Stack
            w={"full"}
            justifyContent={"center"}
            p={{ base: 3, md: 5 }}
            borderRadius="xl"
            _hover={{
              bg: cardBg,
              borderColor: useColorModeValue(
                ColorScheme.light.primary,
                "rgba(200, 230, 78, 0.2)"
              ),
            }}
            border="1px solid"
            borderColor="transparent"
            transition={"ease .25s"}
          >
            <Heading fontSize={{ base: "md", md: "lg" }}>
              <Box
                as="span"
                position={"relative"}
                color={useColorModeValue(
                  ColorScheme.light.primary,
                  ColorScheme.dark.primary
                )}
              >
                {project.title}
              </Box>
            </Heading>
            <Stack flexDirection={"row"}>
              {project.preview_link && (
                <Button
                  href={project.preview_link}
                  target="_blank"
                  as={"a"}
                  rounded="lg"
                  size={"sm"}
                  textAlign={"end"}
                >
                  Preview{" "}
                  <Box pl={2} as="span">
                    {" "}
                    <PlayOne />
                  </Box>
                </Button>
              )}

              {project.source_code_link && (
                <Button
                  href={project.source_code_link}
                  as={"a"}
                  target="_blank"
                  rounded="lg"
                  size={"sm"}
                  variant={"ghost"}
                >
                  Source Code
                  <Box pl={2} as="span">
                    {" "}
                    <Code />
                  </Box>
                </Button>
              )}

              {project.blog_link && (
                <Button
                  href={project.blog_link}
                  as={"a"}
                  target="_blank"
                  rounded="lg"
                  size={"sm"}
                  variant={"ghost"}
                >
                  Read Post
                  <Box pl={2} as="span">
                    {" "}
                    <Pencil />
                  </Box>
                </Button>
              )}
            </Stack>
          </Stack>
        </PopoverTrigger>

        <PopoverContent
          bg={useColorModeValue(ColorScheme.light.bg, ColorScheme.dark.bg)}
          border="1px solid"
          borderColor={cardBorder}
          borderRadius="xl"
          p={5}
        >
          <Box
            position={"relative"}
            display={{ base: "flex", md: "none" }}
            alignItems={"center"}
            justifyContent={"center"}
            aspectRatio={1}
            overflow={"hidden"}
            rounded={10}
            mb={5}
          >
            <Image width={"full"} src={project.image} alt={project.title} />
          </Box>
          <Box mb={5}>
            <Heading fontSize={"md"} mb={2}>
              Overview
            </Heading>
            <Content>{project.description}</Content>
          </Box>
          <Box my={2}>
            <Heading fontSize={"md"} mb={2}>
              Tools
            </Heading>
            <List>
              {project.stack.map((tool, i) => (
                <HStack gap={2} key={i}>
                  <ListIcon as={() => <ArrowRight />} />
                  <Box>{tool}</Box>
                </HStack>
              ))}
            </List>
          </Box>
        </PopoverContent>
      </Popover>
    </Stack>
  );
}

export default function Projects() {
  return (
    <Box>
      <Title>my work.</Title>

      <SimpleGrid mt={10} columns={1} spacing={5}>
        {projects.map((project, _i) => (
          <Project project={project} key={_i} />
        ))}
      </SimpleGrid>
    </Box>
  );
}
