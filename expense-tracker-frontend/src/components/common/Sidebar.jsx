import React from 'react';
import { Box, VStack, Text, Icon, Flex } from '@chakra-ui/react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiDollarSign, 
  FiTarget, 
  FiBarChart2, 
  FiSettings 
} from 'react-icons/fi';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: FiHome },
  { name: 'Expenses', href: '/expenses', icon: FiDollarSign },
  { name: 'Budgets', href: '/budgets', icon: FiTarget },
  { name: 'Reports', href: '/reports', icon: FiBarChart2 },
  { name: 'Settings', href: '/settings', icon: FiSettings },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <Box
      w="250px"
      h="calc(100vh - 80px)"
      bg="white"
      shadow="sm"
      p={4}
    >
      <VStack spacing={1} align="stretch">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Box
              key={item.name}
              as={NavLink}
              to={item.href}
              p={3}
              rounded="lg"
              bg={isActive ? 'brand.50' : 'transparent'}
              color={isActive ? 'brand.600' : 'gray.600'}
              _hover={{ bg: 'brand.50', color: 'brand.600' }}
              transition="all 0.2s"
            >
              <Flex align="center" gap={3}>
                <Icon as={item.icon} boxSize={5} />
                <Text fontWeight={isActive ? 'semibold' : 'medium'}>
                  {item.name}
                </Text>
              </Flex>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};

export default Sidebar;
