import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Text,
  HStack,
  Link,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const linkColor = useColorModeValue('blue.600', 'blue.400');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { success } = await register(formData);
    if (success) {
      navigate('/');
    }
  };

  return (
    <Container maxW="sm" py={10}>
      <VStack spacing={8} align="stretch">
        <VStack spacing={2}>
          <Heading size="lg" textAlign="center">Create Account</Heading>
          <Text color={textColor} textAlign="center">
            Join MoneyTrail and take control of your finances
          </Text>
        </VStack>
        
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Full Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
              />
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              mt={4}
              size="lg"
            >
              Create Account
            </Button>
          </VStack>
        </form>

        <VStack spacing={4}>
          <Divider />
          <HStack justify="center" spacing={1}>
            <Text color={textColor} fontSize="sm">
              Already have an account?
            </Text>
            <Link
              as={RouterLink}
              to="/login"
              color={linkColor}
              fontWeight="semibold"
              fontSize="sm"
              _hover={{
                textDecoration: 'underline',
                color: useColorModeValue('blue.700', 'blue.300')
              }}
            >
              Sign in
            </Link>
          </HStack>
        </VStack>
      </VStack>
    </Container>
  );
};

export default Register;