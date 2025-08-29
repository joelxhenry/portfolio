import { Box, Button, Stack } from "@chakra-ui/react";
import Title from "../components/title";
import { Content } from "./header";

export default function AboutMe() {
  return (
    <Stack alignItems={"center"} textAlign={"center"}>
      <Title>about me.</Title>
      <Box py={10} display={"flex"} flexDirection={"column"} gap={5}>
        <Content>
          {`A tech-savvy creative based in Kingston, Jamaica 🇯🇲. With a background in full-stack software development, I’ve spent the past few years building scalable systems, contributing to cross-functional teams, and solving real-world problems with clean, efficient code.`}
        </Content>
        <Content>{`My journey has taken me through Laravel, Vue, React, Yii and AWS — crafting everything from authentication microservices to inventory management systems and POS systems. But lately, I’ve been charting a new course: exploring the world of DevOps. I’m currently diving deep into containerization, Kubernetes, and infrastructure automation, with a strong focus on building a homelab, documenting my learning, and earning top-tier certifications like the CKA and CKS.
`}</Content>
        <Content>{`Beyond the keyboard, I'm passionate about sharing knowledge — whether it's through technical blogs, open-source contributions, or simply helping others grow. My goal? To build secure, reliable systems while staying grounded, adaptable, and always curious.`}</Content>

        <Content>{`You can explore my detailed project work, technical tutorials, and DevOps learning journey through my blog posts below — where I document everything from homelab setups to Kubernetes deployments and real-world problem solving.`}</Content>

        <Content>{`Let's connect if you're into DevOps, cloud tech, or just good conversation about building things that work.`}</Content>
      </Box>

      <Button rounded={0} textAlign={"end"}>
        Download Resume
      </Button>
    </Stack>
  );
}
