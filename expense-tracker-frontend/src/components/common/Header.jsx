import React from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  IconButton,
  useColorModeValue,
  HStack,
  MenuDivider,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon, BellIcon, UserIcon, SettingsIcon, LogOutIcon } from '@chakra-ui/icons';
import { FiUser, FiSettings, FiLogOut, FiBell } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  
  // Theme-aware colors
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const shadow = useColorModeValue('lg', 'dark-lg');
  const logoGradient = useColorModeValue(
    'linear(to-r, blue.500, purple.600)',
    'linear(to-r, blue.300, purple.400)'
  );
  const logoTextShadow = useColorModeValue(
    '0 2px 4px rgba(0,0,0,0.1)',
    '0 2px 4px rgba(0,0,0,0.3)'
  );

  const handleProfileClick = () => {
    navigate('/settings');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box 
      bg={bg} 
      shadow={shadow} 
      px={8} 
      py={4}
      borderBottom="1px solid"
      borderColor={borderColor}
      position="sticky"
      top="0"
      zIndex="sticky"
      backdropFilter="blur(10px)"
    >
      <Flex justify="space-between" align="center">
        {/* Logo/Brand */}
        <Box cursor="pointer" onClick={() => navigate('/dashboard')}>
          <Text 
            fontSize="3xl" 
            fontWeight="900"
            bgGradient={logoGradient}
            bgClip="text"
            textShadow={logoTextShadow}
            fontFamily="'Poppins', 'Inter', sans-serif"
            letterSpacing="-0.025em"
            _hover={{
              transform: 'scale(1.02)',
              transition: 'transform 0.2s ease-in-out'
            }}
            transition="transform 0.2s ease-in-out"
          >
            💰 MoneyTrail
          </Text>
        </Box>
        
        {/* Right Side Actions */}
        <HStack spacing={4} align="center">
         
          {/* Dark Mode Toggle */}
          <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`} placement="bottom">
            <IconButton
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
              size="lg"
              aria-label="Toggle color mode"
              _hover={{
                bg: useColorModeValue('gray.100', 'gray.700'),
                transform: 'rotate(180deg)'
              }}
              transition="all 0.3s ease-in-out"
            />
          </Tooltip>
          
          {/* User Menu */}
          <Menu>
            <Tooltip label="Account Menu" placement="bottom">
              <MenuButton 
                as={Button} 
                variant="ghost"
                size="lg"
                _hover={{
                  bg: useColorModeValue('gray.100', 'gray.700'),
                  transform: 'scale(1.05)'
                }}
                _active={{
                  bg: useColorModeValue('gray.200', 'gray.600'),
                }}
                transition="all 0.2s"
                borderRadius="full"
                p={2}
              >
                <HStack spacing={3}>
                  <Avatar 
                    size="sm" 
                    name={user?.name || 'User'} 
                    src={user?.avatar}
                    bg="blue.500"
                    color="white"
                    border="2px solid"
                    borderColor={useColorModeValue('gray.200', 'gray.600')}
                  />
                  <Box textAlign="left" display={{ base: 'none', md: 'block' }}>
                    <Text fontSize="sm" fontWeight="semibold">
                      {user?.name || 'User'}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {user?.email || 'user@example.com'}
                    </Text>
                  </Box>
                </HStack>
              </MenuButton>
            </Tooltip>
            
            <MenuList
              bg={useColorModeValue('white', 'gray.800')}
              borderColor={useColorModeValue('gray.200', 'gray.700')}
              shadow="xl"
              border="1px solid"
              borderRadius="xl"
              py={2}
              minW="200px"
            >
              {/* User Info Header */}
              <Box px={4} py={3} borderBottom="1px solid" borderColor={useColorModeValue('gray.100', 'gray.700')}>
                <Text fontSize="sm" fontWeight="semibold">
                  {user?.name || 'User'}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {user?.email || 'user@example.com'}
                </Text>
              </Box>

              <MenuItem 
                icon={<FiUser size="16" />}
                onClick={handleProfileClick}
                fontSize="sm"
                fontWeight="medium"
                _hover={{
                  bg: useColorModeValue('blue.50', 'blue.900'),
                  color: useColorModeValue('blue.600', 'blue.300')
                }}
                py={3}
              >
                Profile
              </MenuItem>
              
              <MenuItem 
                icon={<FiSettings size="16" />}
                onClick={handleSettingsClick}
                fontSize="sm"
                fontWeight="medium"
                _hover={{
                  bg: useColorModeValue('blue.50', 'blue.900'),
                  color: useColorModeValue('blue.600', 'blue.300')
                }}
                py={3}
              >
                Settings
              </MenuItem>
              
              <MenuDivider my={2} />
              
              <MenuItem 
                icon={<FiLogOut size="16" />}
                onClick={handleLogout}
                fontSize="sm"
                fontWeight="medium"
                color="red.500"
                _hover={{
                  bg: useColorModeValue('red.50', 'red.900'),
                  color: useColorModeValue('red.600', 'red.300')
                }}
                py={3}
              >
                Sign Out
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
