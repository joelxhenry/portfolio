import { Box, Image, Stack, Text, useBreakpointValue } from "@chakra-ui/react";
import Title from "../components/title";
import Slide from "react-slick";
import skills from "../content/skills";

export default function Skills() {
  const slidesToShow = useBreakpointValue({
    base: 4,
    md: 7,
    lg: 10,
  });

  const slidesToScroll = useBreakpointValue({
    base: 2,
    md: 3,
    lg: 5,
  });

  return (
    <Slide
      {...{
        slidesToShow,
        slidesToScroll,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 2000,
        arrows: false,
        swipe: false,
        speed: 3000,
      }}
    >
      {skills.map((skill, _index) => (
        <Box
          key={_index}
          aspectRatio={"1/1"}
          display={"flex !important"}
          w={"full"}
          h={"full"}
          px={10}
          alignItems={"center"}
          justifyContent={"center"}
          flex={"column"}
        >
          <Image src={skill.image} alt={skill.name} />
        </Box>
      ))}
    </Slide>
  );
}
