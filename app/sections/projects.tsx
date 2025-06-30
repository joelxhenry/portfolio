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
  useColorMode,
  Stack,
} from "@chakra-ui/react";
import projects, { ProjectInterface } from "../content/projects";
import ColorScheme from "../assets/colors";
import { Content } from "./header";
import { ArrowRight, Code, PlayOne } from "@icon-park/react";

function Project({ project }: { project: ProjectInterface }) {
  const placement = useBreakpointValue<PlacementWithLogical>({
    base: "bottom",
    lg: "right",
  });

  return (
    <Stack
      flexDirection={"row"}
      spacing={3}
      width={{ base: "full", md: "80%", lg: "75%" }}
    >
      <Box
        position={"relative"}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
        aspectRatio={1}
        overflow={"hidden"}
        width={"25%"}
        shadow={"md"}
        rounded={10}
      >
        <Image width={"full"} src={project.image} alt={project.title} />
      </Box>
      <Popover trigger="hover" placement={placement}>
        <PopoverTrigger>
          <Stack
            w={"full"}
            justifyContent={"center"}
            p={{ base: 3, md: 5 }}
            borderRadius="md"
            _hover={{
              shadow: "lg",
              bg: useColorModeValue(ColorScheme.light.bg, ColorScheme.dark.bg),
            }}
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
                  rounded={0}
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
                  rounded={0}
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
            </Stack>
          </Stack>
        </PopoverTrigger>

        <PopoverContent
          bg={useColorModeValue(ColorScheme.light.bg, ColorScheme.dark.bg)}
          p={5}
        >
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
      <Title>my projects.</Title>

      <SimpleGrid mt={10} columns={1} spacing={5}>
        {projects.map((project, _i) => (
          <Project project={project} key={_i} />
        ))}
      </SimpleGrid>
    </Box>
  );
}
