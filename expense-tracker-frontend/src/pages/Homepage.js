import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  useColorModeValue,
  Flex,
  Stack,
  Badge,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { 
  FiTrendingUp, 
  FiPieChart, 
  FiTarget, 
  FiShield,
  FiSmartphone,
  FiBarChart2,
  FiArrowRight,
  FiCheckCircle
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const FeatureCard = ({ icon, title, description }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      p={6}
      _hover={{
        transform: 'translateY(-4px)',
        shadow: 'xl',
        borderColor: 'blue.300',
      }}
      transition="all 0.3s ease-in-out"
    >
      <VStack spacing={4} align="start">
        <Box
          p={3}
          bg="blue.50"
          borderRadius="lg"
          color="blue.600"
          _dark={{
            bg: 'blue.900',
            color: 'blue.300'
          }}
        >
          <Icon as={icon} boxSize={6} />
        </Box>
        <Heading size="md" fontWeight="600">
          {title}
        </Heading>
        <Text color="gray.600" _dark={{ color: 'gray.400' }} fontSize="sm" lineHeight="tall">
          {description}
        </Text>
      </VStack>
    </Box>
  );
};

const StatCard = ({ number, label }) => {
  return (
    <VStack spacing={1}>
      <Text fontSize="3xl" fontWeight="bold" color="blue.600" _dark={{ color: 'blue.400' }}>
        {number}
      </Text>
      <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
        {label}
      </Text>
    </VStack>
  );
};

const Homepage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const bg = useColorModeValue('gray.50', 'gray.900');
  const headerBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const accentColor = useColorModeValue('blue.600', 'blue.400');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: FiTrendingUp,
      title: 'Track Expenses',
      description: 'Monitor your spending patterns and identify areas where you can save money effectively.'
    },
    {
      icon: FiTarget,
      title: 'Budget Management',
      description: 'Set realistic budgets for different categories and track your progress in real-time.'
    },
    {
      icon: FiPieChart,
      title: 'Visual Reports',
      description: 'Get insights with beautiful charts and graphs that make your financial data easy to understand.'
    },
    {
      icon: FiShield,
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and secure with industry-standard security measures.'
    },
    {
      icon: FiSmartphone,
      title: 'Easy to Use',
      description: 'Intuitive interface designed for quick expense entry and effortless financial management.'
    },
    {
      icon: FiBarChart2,
      title: 'Smart Analytics',
      description: 'AI-powered insights help you make better financial decisions and reach your goals faster.'
    }
  ];

  return (
    <Box bg={bg} minH="100vh">
      {/* Header */}
      <Box 
        bg={headerBg} 
        shadow="sm" 
        borderBottom="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        position="sticky"
        top="0"
        zIndex="sticky"
      >
        <Container maxW="7xl" py={4}>
          <Flex justify="space-between" align="center">
            <HStack spacing={2} align="center">
              <Text 
                fontSize="2xl" 
                fontWeight="700"
                color={useColorModeValue('gray.800', 'white')}
                fontFamily="'SF Pro Display', 'Segoe UI', 'Inter', system-ui, -apple-system, sans-serif"
                letterSpacing="-0.02em"
              >
                MoneyTrail
              </Text>
              <Box
                w="6px"
                h="6px"
                bg={accentColor}
                borderRadius="full"
                opacity={0.8}
              />
            </HStack>
            
            <HStack spacing={4}>
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                fontWeight="500"
              >
                Sign In
              </Button>
              <Button
                colorScheme="blue"
                onClick={() => navigate('/register')}
                fontWeight="500"
                rightIcon={<FiArrowRight />}
                _hover={{
                  transform: 'translateY(-1px)',
                  shadow: 'lg'
                }}
                transition="all 0.2s"
              >
                Get Started
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container maxW="7xl" py={20}>
        <VStack spacing={8} textAlign="center" mb={16}>
          <Badge 
            colorScheme="blue" 
            px={4} 
            py={2} 
            borderRadius="full" 
            fontSize="sm"
            fontWeight="500"
          >
            Personal Finance Made Simple
          </Badge>
          
          <Heading
            fontSize={{ base: '4xl', md: '6xl' }}
            fontWeight="700"
            letterSpacing="-0.02em"
            lineHeight="shorter"
            maxW="4xl"
            fontFamily="'SF Pro Display', 'Segoe UI', 'Inter', system-ui, -apple-system, sans-serif"
          >
            Take Control of Your{' '}
            <Text as="span" color={accentColor}>
              Financial Future
            </Text>
          </Heading>
          
          <Text
            fontSize={{ base: 'lg', md: 'xl' }}
            color={textColor}
            maxW="2xl"
            lineHeight="tall"
          >
            Track expenses, set budgets, and gain insights into your spending habits with our intuitive expense tracking platform.
          </Text>
          
          <Stack direction={{ base: 'column', md: 'row' }} spacing={4} pt={4}>
            <Button
              size="lg"
              colorScheme="blue"
              onClick={() => navigate('/register')}
              rightIcon={<FiArrowRight />}
              fontWeight="500"
              px={8}
              py={6}
              fontSize="lg"
              _hover={{
                transform: 'translateY(-2px)',
                shadow: 'xl'
              }}
              transition="all 0.3s"
            >
              Start Free Today
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              fontWeight="500"
              px={8}
              py={6}
              fontSize="lg"
              _hover={{
                bg: useColorModeValue('gray.50', 'gray.800')
              }}
            >
              Sign In
            </Button>
          </Stack>
        </VStack>

        {/* Stats */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8} mb={20}>
          <StatCard number="10K+" label="Active Users" />
          <StatCard number="$2M+" label="Money Tracked" />
          <StatCard number="50K+" label="Transactions" />
          <StatCard number="99.9%" label="Uptime" />
        </SimpleGrid>

        {/* Features */}
        <VStack spacing={12} mb={20}>
          <VStack spacing={4} textAlign="center">
            <Heading size="xl" fontWeight="600">
              Everything you need to manage your money
            </Heading>
            <Text fontSize="lg" color={textColor} maxW="2xl">
              Powerful features designed to make expense tracking effortless and insightful.
            </Text>
          </VStack>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </SimpleGrid>
        </VStack>

        {/* CTA Section */}
        <Box
          bg={useColorModeValue('blue.50', 'blue.900')}
          borderRadius="2xl"
          p={{ base: 8, md: 12 }}
          textAlign="center"
        >
          <VStack spacing={6}>
            <Heading size="lg" fontWeight="600">
              Ready to start your financial journey?
            </Heading>
            <Text fontSize="lg" color={textColor} maxW="md">
              Join thousands of users who have already taken control of their finances with MoneyTrail.
            </Text>
            <Button
              size="lg"
              colorScheme="blue"
              onClick={() => navigate('/register')}
              rightIcon={<FiArrowRight />}
              fontWeight="500"
              px={8}
              py={6}
              fontSize="lg"
              _hover={{
                transform: 'translateY(-2px)',
                shadow: 'xl'
              }}
              transition="all 0.3s"
            >
              Get Started Free
            </Button>
          </VStack>
        </Box>
      </Container>

      {/* Footer */}
      <Box 
        bg={headerBg} 
        borderTop="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        py={8}
      >
        <Container maxW="7xl">
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align="center"
            spacing={4}
          >
            <HStack spacing={2} align="center">
              <Text 
                fontSize="lg" 
                fontWeight="600"
                color={useColorModeValue('gray.800', 'white')}
                fontFamily="'SF Pro Display', 'Segoe UI', 'Inter', system-ui, -apple-system, sans-serif"
              >
                MoneyTrail
              </Text>
              <Box
                w="4px"
                h="4px"
                bg={accentColor}
                borderRadius="full"
                opacity={0.8}
              />
            </HStack>
            
            <Text fontSize="sm" color={textColor}>
              © 2024 MoneyTrail. Built with care for your financial success.
            </Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default Homepage; 