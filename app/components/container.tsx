import { Box } from "@chakra-ui/react";

interface ContainerProps {
  children: React.ReactNode;
  id?: string;
  group?: boolean;
}

export default function Container({ children, id, group }: ContainerProps) {
  let props: { [key: string]: any } = {
    py: 5,
    px: { base: 10, md: 20, xl: 80 },
  };

  if (id) props = { id, ...props };
  if (group) props = { "data-group": true, ...props };

  return <Box display={'flex'} flexDir={'column'} justifyContent={'center'} minHeight={'70vh'} {...props}>{children}</Box>;
}
