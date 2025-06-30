import { Box, Button, Stack } from "@chakra-ui/react";
import Title from "../components/title";
import { Content } from "./header";

export default function AboutMe() {
  return (
    <Stack alignItems={'center'} textAlign={'center'}>
      <Title>about me.</Title>
      <Box py={10}>
        <Content>
          {`I'm a passionate software developer with an insatiable appetite for problem-solving. I have a proven track record of quickly adapting to new frameworks and technologies, making me a versatile developer. My personal projects have honed my expertise in React, Next.js, and Node, allowing me to craft highly performant and scalable applications.`}
        </Content>
        <Content>{`I'm committed to continuous improvement and staying updated with the latest developments in the field. Whether I'm tackling a complex project solo or collaborating within a team, my driving force is my unwavering love for software development and my relentless pursuit of innovative solutions.`}</Content>
        <Content>{`Explore my portfolio to see how my skills can benefit your projects. I'm always open to new opportunities and challenges. Let's create something extraordinary together.`}</Content>
      </Box>

      <Button rounded={0} textAlign={"end"}>
        Download Resume
      </Button>
    </Stack>
  );
}
