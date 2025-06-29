import React, { useState, useEffect } from 'react';
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
  Text,
  Heading,
  useToast,
  HStack,
  Link,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { login, isAuthenticated, error } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const linkColor = useColorModeValue('blue.600', 'blue.400');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(formData.email, formData.password);
  };

  return (
    <Container maxW="sm" py={10}>
      <VStack spacing={8} align="stretch">
        <VStack spacing={2}>
          <Heading size="lg" textAlign="center">Welcome Back</Heading>
          <Text color={textColor} textAlign="center">
            Sign in to your MoneyTrail account
          </Text>
        </VStack>
        
        {error && (
          <Text color="red.500" textAlign="center" fontSize="sm">
            {error}
          </Text>
        )}
        
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
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
                placeholder="Enter your password"
              />
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              mt={4}
              size="lg"
            >
              Sign In
            </Button>
          </VStack>
        </form>

        <VStack spacing={4}>
          <Divider />
          <HStack justify="center" spacing={1}>
            <Text color={textColor} fontSize="sm">
              Don't have an account?
            </Text>
            <Link
              as={RouterLink}
              to="/register"
              color={linkColor}
              fontWeight="semibold"
              fontSize="sm"
              _hover={{
                textDecoration: 'underline',
                color: useColorModeValue('blue.700', 'blue.300')
              }}
            >
              Sign up
            </Link>
          </HStack>
        </VStack>
      </VStack>
    </Container>
  );
};

export default Login;