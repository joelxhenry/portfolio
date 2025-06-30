import { Search2Icon, SearchIcon } from "@chakra-ui/icons";
import Title from "../components/title";
import {
  Box,
  Grid,
  GridItem,
  Input,
  InputGroup,
  InputRightAddon,
  Image,
  Heading,
  useColorModeValue,
  Card,
  CardBody,
  HStack,
  Button,
  Link,
  List,
  ListItem,
  ListIcon,
  SimpleGrid,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useBreakpointValue,
  PlacementWithLogical,
  Text,
  VStack,
  useColorMode,
} from "@chakra-ui/react";
import projects, { ProjectInterface } from "../content/projects";
import ColorScheme from "../assets/colors";
import { Content } from "./header";
import { ArrowRight, Code, PlayOne } from "@icon-park/react";

function SearchInput() {
  return (
    <>
      <InputGroup borderRadius={"full"}>
        <Input borderRadius={"full"} type="search" />
        <InputRightAddon borderRightRadius={"full"}>
          <SearchIcon />
        </InputRightAddon>
      </InputGroup>
    </>
  );
}

function Project({ project }: { project: ProjectInterface }) {
  const placement = useBreakpointValue<PlacementWithLogical>({
    base: "bottom",
    lg: "right",
  });
  const { colorMode } = useColorMode();

  return (
    <Card
      shadow={"none"}
      h={"full"}
      rounded={10}
      bg={useColorModeValue("whiteAlpha.400", "blackAlpha.400")}
      backdropBlur={"md"}
    >
      <Popover trigger="hover" placement={placement}>
        <PopoverTrigger>
          <Box
            data-group={true}
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"space-between"}
            gap={2}
          >
            <Box
              position={"relative"}
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
              aspectRatio={1}
              overflow={"hidden"}
              width={"full"}
              shadow={"md"}
              rounded={10}
            >
              <Image width={"full"} src={project.image} alt={project.title} />

              <Box
                position={"absolute"}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
                top={-1}
                bottom={-1}
                left={-1}
                right={-1}
                transition={".25s ease"}
                bg={
                  colorMode === "light"
                    ? ColorScheme.light.bg
                    : ColorScheme.dark.bg
                }
                opacity={0}
                _hover={{
                  opacity: 1,
                }}
              >
                <VStack justifyContent={{ base: "center", md: "end" }} gap={3}>
                  <Button
                    href={project.source_code_link}
                    as={"a"}
                    target="_blank"
                    rounded={0}
                    size={"sm"}
                    variant={"ghost"}
                    w="full"
                  >
                    Source Code
                    <Box pl={2} as="span">
                      {" "}
                      <Code />
                    </Box>
                  </Button>
                  <Button
                    href={project.preview_link}
                    target="_blank"
                    as={"a"}
                    w="full"
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
                </VStack>
              </Box>
            </Box>
          </Box>
        </PopoverTrigger>

        <PopoverContent
          bg={useColorModeValue(ColorScheme.light.bg, ColorScheme.dark.bg)}
          p={5}
        >
          <Heading textAlign={"center"} mb={3} fontSize={"lg"}>
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
    </Card>
  );
}

export default function Projects() {
  return (
    <Box>
      <Title>my projects.</Title>

      <SimpleGrid mt={10} columns={{ base: 2, md: 3, lg: 4 }} spacing={5}>
        {projects.map((project, _i) => (
          <Project project={project} key={_i} />
        ))}
      </SimpleGrid>
    </Box>
  );
}
