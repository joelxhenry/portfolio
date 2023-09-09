import Title from '../components/title'
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Stack,
  Text,
  useColorModeValue,
  Image,
} from '@chakra-ui/react'

interface ContentProps {
  children: React.ReactNode
}

function Content({ children }: ContentProps) {
  return (
    <Text fontWeight={'medium'} opacity={0.6} fontSize={'16px'}>
      {children}
    </Text>
  )
}

export default function Header() {
  return (
    <>
      <Grid templateColumns="repeat(6, 1fr)" gap={5}>
        <GridItem h={'100%'} colSpan={{ base: 6, lg: 3 }}>
          <Stack h={'100%'} justifyContent={'space-around'}>
            <Stack
              spacing={1}
              color={useColorModeValue('#282930', '#f9fcf8')}
              fontFamily={'Inter'}
            >
              <Title size="5xl">Joel Henry</Title>
              <Heading opacity={0.8} fontSize={'24px'} fontWeight={'medium'}>
                {'Full-stack Developer'}
              </Heading>
              <Heading
                opacity={0.5}
                maxW={'60%'}
                fontSize={'16px'}
                fontWeight={'normal'}
              >
                {
                  'I build reliable, accessible and responsive digital solutions for the web and mobile devices'
                }
              </Heading>
            </Stack>

            <Stack direction={'row'} spacing={5}>
              <Box as="a" href="#" aspectRatio={'1/1'} width={8}>
                <Image w={'full'} src="/linkedin.png" alt="linkedin" />
              </Box>
              <Box
                borderRadius={'full'}
                as="a"
                href="#"
                aspectRatio={'1/1'}
                width={8}
              >
                <Image w={'full'} src="/github.png" alt="githubS" />
              </Box>
            </Stack>
          </Stack>
        </GridItem>
        <GridItem colSpan={{ base: 6, lg: 3 }}>
          <Stack direction={'column'} spacing={2}>
            <Content>
              {`I'm a passionate software developer with an insatiable appetite for problem-solving. I have a proven track record of quickly adapting to new frameworks and technologies, making me a versatile developer. My personal projects have honed my expertise in React, Next.js, and Node, allowing me to craft highly performant and scalable applications.`}
            </Content>
            <Content>{`I'm committed to continuous improvement and staying updated with the latest developments in the field. Whether I'm tackling a complex project solo or collaborating within a team, my driving force is my unwavering love for software development and my relentless pursuit of innovative solutions.`}</Content>
            <Content>{`Explore my portfolio to see how my skills can benefit your projects. I'm always open to new opportunities and challenges. Let's create something extraordinary together.`}</Content>
          </Stack>
        </GridItem>
      </Grid>
    </>
  )
}
