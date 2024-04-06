import { Box, Image, Stack, Text } from '@chakra-ui/react'
import Title from '../components/title'
import Slide from 'react-slick'
import skills from '../content/skills'

export default function Skills() {
  return (
    <Slide
      {...{
        slidesToShow: 7,
        slidesToScroll: 5,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 2000,
        arrows: false,
        swipe: false,
        speed: 3000,
        responsive: [],
      }}
    >
      {skills.map((skill, _index) => (
        <Box
          key={_index}
          aspectRatio={'1/1'}
          display={'flex !important'}
          w={'full'}
          h={'full'}
          p={10}
          alignItems={'center'}
          justifyContent={'center'}
          flex={'column'}
        >
          <Image src={skill.image} alt={skill.name} />
        </Box>
      ))}
    </Slide>
  )
}
