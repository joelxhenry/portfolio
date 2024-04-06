import { Box } from '@chakra-ui/react'

interface ContainerProps {
  children: React.ReactNode
  id?: string
  group?: boolean
}

export default function Container({ children, id, group }: ContainerProps) {
  let props: { [key: string]: any } = {
    py: 5,
    px: { base: 10, md: 40, lg: 40 },
  }

  if (id) props = { id, ...props }
  if (group) props = { 'data-group': true, ...props }

  return <Box {...props}>{children}</Box>
}
