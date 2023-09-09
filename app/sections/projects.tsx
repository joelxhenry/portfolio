import { Search2Icon, SearchIcon } from '@chakra-ui/icons'
import Title from '../components/title'
import {
  Box,
  Grid,
  GridItem,
  Input,
  InputAddon,
  InputGroup,
  InputRightAddon,
} from '@chakra-ui/react'

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

export default function Projects() {
  return (
    <Box>
      <Title>my projects.</Title>

      <Grid py={10} templateColumns={'repeat(12,1fr)'}>
        <GridItem colSpan={{ base: 12, lg: 4 }}>
          <SearchInput />
        </GridItem>
        <GridItem colSpan={{ base: 12, lg: 8 }}></GridItem>
      </Grid>
    </Box>
  )
}
