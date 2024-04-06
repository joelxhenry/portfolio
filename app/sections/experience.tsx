import { ArrowForwardIcon } from '@chakra-ui/icons'
import Title from '../components/title'
import { HStack, Stack } from '@chakra-ui/react'
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Heading,
  Text,
  Flex,
  useColorModeValue,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react'
import ColorScheme from '../assets/colors'
import experiences, { ExperienceInterface } from '../content/experience'

interface ExperiencePanelProps {
  data: ExperienceInterface
}
interface ExperienceTabProps {
  children: React.ReactNode
}

function Skill({ skill }: { skill: string }) {
  return (
    <HStack
      color={useColorModeValue(ColorScheme.light.text, ColorScheme.dark.text)}
      bg={useColorModeValue(
        ColorScheme.light.secondary,
        ColorScheme.dark.secondary,
      )}
      py={'1px'}
      px={3}
      borderRadius={'full'}
    >
      <Box
        textTransform={'uppercase'}
        whiteSpace={'nowrap'}
        fontSize={'10px'}
        fontWeight={'bold'}
      >
        {skill}
      </Box>
    </HStack>
  )
}

function ExperiencePanel({
  data: { position, company, period, pointers, skills },
}: ExperiencePanelProps) {
  return (
    <TabPanel>
      <Box data-group>
        <Flex alignItems={'center'} gap={1}>
          <Heading fontSize={'md'}>
            {position}{' '}
            <Box
              as="span"
              position={'relative'}
              color={useColorModeValue(
                ColorScheme.light.primary,
                ColorScheme.dark.primary,
              )}
            >
              @ {company}
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
        </Flex>
        <Text opacity={0.5} fontSize={'xs'}>
          {period}
        </Text>

        <Flex mt={5} gap={2}>
          {skills.map((skill, index) => (
            <Skill skill={skill} key={index} />
          ))}
        </Flex>

        <List py={5} spacing={2}>
          {pointers.map((point, index) => (
            <ListItem key={index}>
              <Stack fontSize={'sm'} direction={'row'}>
                <ListIcon mt={1} as={ArrowForwardIcon} />
                <Text opacity={0.7}>{point}</Text>
              </Stack>
            </ListItem>
          ))}
        </List>
      </Box>
    </TabPanel>
  )
}

function ExperienceTab({ children }: ExperienceTabProps) {
  return (
    <Tab
      px={2}
      justifyContent={'start'}
      whiteSpace={'nowrap'}
      textAlign={'left'}
      fontWeight={'semibold'}
      fontSize={'sm'}
    >
      {children}
    </Tab>
  )
}

export default function Experience() {
  return (
    <Box>
      <Title>my experience.</Title>
      <Box py={10}>
        <Tabs
          colorScheme={useColorModeValue('blackAlpha', 'whiteAlpha')}
          px={{ base: 0, md: 10, lg: 20 }}
          orientation={'vertical'}
        >
          <TabList>
            {experiences.map(({ label }, index) => (
              <ExperienceTab key={index}>{label}</ExperienceTab>
            ))}
          </TabList>

          <TabPanels>
            {experiences.map((experience, index) => (
              <ExperiencePanel key={index} data={experience} />
            ))}
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  )
}
