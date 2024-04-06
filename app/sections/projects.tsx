import { Search2Icon, SearchIcon } from '@chakra-ui/icons'
import Title from '../components/title'
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
} from '@chakra-ui/react'
import Skills from './skills'
import projects, { ProjectInterface } from '../content/projects'
import ColorScheme from '../assets/colors'
import { Content } from './header'
import Slider from 'react-slick'
import { ArrowRight, Code, PlayOne } from '@icon-park/react'

function SearchInput() {
  return (
    <>
      <InputGroup borderRadius={'full'}>
        <Input borderRadius={'full'} type="search" />
        <InputRightAddon borderRightRadius={'full'}>
          <SearchIcon />
        </InputRightAddon>
      </InputGroup>
    </>
  )
}

function Project({ project }: { project: ProjectInterface }) {
  return (
    <Card
      shadow={'md'}
      h={'full'}
      rounded={10}
      bg={useColorModeValue('whiteAlpha.400', 'blackAlpha.400')}
      backdropBlur={'md'}
      border={`0.5px solid ${useColorModeValue(
        ColorScheme.light.primary,
        ColorScheme.dark.primary,
      )}`}
    >
      <CardBody>
        <Grid alignItems={'center'} templateColumns={'repeat(12,1fr)'} gap={10}>
          <GridItem colSpan={{ base: 12, md: 4, lg: 5 }}>
            <Image
              shadow={'md'}
              rounded={10}
              src={project.image}
              alt={project.title}
            />
          </GridItem>
          <GridItem colSpan={{ base: 12, md: 8, lg: 7 }}>
            <Heading mb={10} fontSize={'lg'}>
              <Box
                as="span"
                position={'relative'}
                color={useColorModeValue(
                  ColorScheme.light.primary,
                  ColorScheme.dark.primary,
                )}
              >
                {project.title}
                <Box
                  position={'absolute'}
                  borderBottom={useColorModeValue(
                    `2px solid ${ColorScheme.light.primary}`,
                    `2px solid ${ColorScheme.dark.primary}`,
                  )}
                  bottom={0}
                  left={'100%'}
                  right={0}
                  transition={'.5s'}
                  _groupHover={{
                    left: '25%',
                  }}
                ></Box>
              </Box>
            </Heading>

            <Box mb={5}>
              <Heading fontSize={'md'} mb={2}>
                Overview
              </Heading>
              <Content>{project.description}</Content>
            </Box>
          </GridItem>
        </Grid>

        <Box my={2}>
          <Heading fontSize={'md'} mb={2}>
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

        <HStack justifyContent={'end'} gap={5}>
          <Button
            href={project.source_code_link}
            as={'a'}
            target="_blank"
            rounded={0}
            size={'sm'}
          >
            Source Code
            <Box pl={2} as="span">
              {' '}
              <Code />
            </Box>
          </Button>
          <Button
            href={project.preview_link}
            target="_blank"
            as={'a'}
            bg={useColorModeValue(
              ColorScheme.light.primary,
              ColorScheme.dark.primary,
            )}
            color={useColorModeValue(
              ColorScheme.dark.text,
              ColorScheme.light.text,
            )}
            w={'50%'}
            rounded={0}
            size={'sm'}
            textAlign={'end'}
          >
            Preview{' '}
            <Box pl={2} as="span">
              {' '}
              <PlayOne />
            </Box>
          </Button>
        </HStack>
      </CardBody>
    </Card>
  )
}

export default function Projects() {
  return (
    <Box>
      <Title>my projects.</Title>

      <Grid py={10} templateColumns={'repeat(12,1fr)'}>
        <GridItem colSpan={{ base: 12, lg: 4 }}>
          <SearchInput />
        </GridItem>
        <GridItem colSpan={{ base: 12, lg: 8 }} px={10}>
          <Slider
            {...{
              fade: true,
            }}
          >
            {projects.map((project, _i) => (
              <Project project={project} key={_i} />
            ))}
          </Slider>
        </GridItem>
      </Grid>
    </Box>
  )
}
