import React from 'react';
import { Box } from '@chakra-ui/react';

const Card = ({ children, ...props }) => {
  return (
    <Box
      bg="white"
      shadow="sm"
      rounded="lg"
      p={6}
      border="1px"
      borderColor="gray.200"
      {...props}
    >
      {children}
    </Box>
  );
};

export default Card;
