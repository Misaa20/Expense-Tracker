import React from 'react';
import { Button as ChakraButton } from '@chakra-ui/react';

const Button = ({ children, variant = 'solid', ...props }) => {
  const variants = {
    solid: {
      bg: 'brand.500',
      color: 'white',
      _hover: { bg: 'brand.600' }
    },
    outline: {
      border: '2px',
      borderColor: 'brand.500',
      color: 'brand.500',
      _hover: { bg: 'brand.50' }
    },
    ghost: {
      color: 'brand.500',
      _hover: { bg: 'brand.50' }
    }
  };

  return (
    <ChakraButton
      {...variants[variant]}
      {...props}
    >
      {children}
    </ChakraButton>
  );
};

export default Button;
