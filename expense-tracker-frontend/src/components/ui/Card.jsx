import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';

const Card = ({ children, ...props }) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const shadow = useColorModeValue('md', 'dark-lg');

  return (
    <Box
      bg={bg}
      borderRadius="lg"
      shadow={shadow}
      border="1px solid"
      borderColor={borderColor}
      p={6}
      {...props}
    >
      {children}
    </Box>
  );
};

export default Card;
