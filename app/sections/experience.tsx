import { ArrowForwardIcon } from '@chakra-ui/icons'
import Title from '../components/title'
import { Stack } from '@chakra-ui/react'
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

interface IExperience {
  label: string
  company: string
  period: string
  position: string
  pointers: string[]
}

interface ExperiencePanelProps {
  data: IExperience
}
interface ExperienceTabProps {
  children: React.ReactNode
}

function ExperiencePanel({
  data: { position, company, period, pointers },
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
              color={useColorModeValue('#31ac74', '#aed583')}
            >
              @ {company}
              <Box
                position={'absolute'}
                borderBottom={useColorModeValue(
                  '2px solid #31ac74',
                  '2px solid #aed583',
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
    <Tab>
      <Text size={'sm'} whiteSpace={'nowrap'}>
        {children}
      </Text>
    </Tab>
  )
}

export default function Experience() {
  const experiences: IExperience[] = [
    {
      label: 'Crixus Tech',
      company: 'Crixus Tech',
      period: 'Dec 2022 - Present',
      position: 'Junior Software Developer',
      pointers: [
        `Utilized Yii2 and .NET frameworks following the MVC architectural pattern to develop highly scalable and reliable software 
        solutions, meeting clients' requirements and goals.
        `,
        ` Developed and maintained RESTful APIs, ensuring seamless communication between application components.`,
        `Employed caching and code optimization techniques to improve API response time by an impressive 92%, enhancing overall system performance and delivering a smoother user experience.`,
        `Wrote comprehensive unit, functional, and acceptance tests using the Codeception PHP testing framework, guaranteeing the quality and stability of the developed software, and supporting efficient debugging and maintenance processes.`,
      ],
    },
    {
      label: 'Export Academy',
      company: 'Jamaica Trade Board Ltd.',
      period: 'Feb 2023 - Present',
      position: 'Full-stack Developer (Intern)',
      pointers: [
        `Contributed to the design and development of a new initiative of the Government of Jamaica and the Jamaica Trade Board to reduce the knowledge in exporting products from the country, by promoting and facilitating increased product exportation for businesses and individuals.`,
        `Exhibited strong communication skills, effectively translating technical concepts to non-technical stakeholders, ensuring clear understanding and alignment of project objectives.`,
        `Utilized full-stack development skills to implement the platform using the PHP Laravel framework, following the MVC architectural pattern, and gaining valuable insights and knowledge throughout the web development process.`,
      ],
    },
  ]

  return (
    <Box>
      <Title>my experience.</Title>
      <Box py={10}>
        <Tabs
          colorScheme={useColorModeValue('blackAlpha', 'whiteAlpha')}
          px={{ base: 0, md: 10, lg: 20 }}
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
