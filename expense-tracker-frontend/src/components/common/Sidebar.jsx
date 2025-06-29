import React from 'react';
import {
  Box,
  VStack,
  Link,
  Icon,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiDollarSign,
  FiPieChart,
  FiBarChart2,
  FiSettings,
  FiTarget
} from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();
  
  // Theme-aware colors - ALL hooks must be called at the top level
  const bg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('blue.600', 'blue.300');
  const hoverBg = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const activeTextColor = useColorModeValue('blue.600', 'blue.300');
  const hoverTextColor = useColorModeValue('gray.800', 'white');

  const menuItems = [
    { name: 'Dashboard', icon: FiHome, path: '/dashboard' },
    { name: 'Expenses', icon: FiDollarSign, path: '/expenses' },
    { name: 'Budget', icon: FiTarget, path: '/budgets' },
    { name: 'Reports', icon: FiBarChart2, path: '/reports' },
    { name: 'Settings', icon: FiSettings, path: '/settings' },
  ];

  return (
    <Box
      bg={bg}
      borderRight="1px solid"
      borderColor={borderColor}
      w="250px"
      h="calc(100vh - 73px)"
      p={4}
      position="sticky"
      top="73px"
    >
      <VStack spacing={2} align="stretch">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              as={RouterLink}
              to={item.path}
              textDecoration="none"
              _hover={{ textDecoration: 'none' }}
            >
              <Box
                display="flex"
                alignItems="center"
                p={3}
                borderRadius="lg"
                bg={isActive ? activeBg : 'transparent'}
                color={isActive ? activeTextColor : textColor}
                _hover={{
                  bg: isActive ? activeBg : hoverBg,
                  color: isActive ? activeTextColor : hoverTextColor
                }}
                transition="all 0.2s"
                fontWeight={isActive ? 'semibold' : 'medium'}
              >
                <Icon as={item.icon} mr={3} boxSize={5} />
                <Text fontSize="sm">{item.name}</Text>
              </Box>
            </Link>
          );
        })}
      </VStack>
    </Box>
  );
};

export default Sidebar;