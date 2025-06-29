import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  HStack,
  Text,
  Switch,
  Select,
  Divider,
  useToast,
  Card,
  CardBody,
  Avatar,
  IconButton,
  useColorMode,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Center,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiEdit2, FiSave, FiX } from 'react-icons/fi';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { userService } from '../services/user';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const { user: authUser, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    currency: 'USD',
    monthlyBudget: 0,
    preferences: {
      darkMode: colorMode === 'dark',
      compactView: false,
      defaultView: 'dashboard',
    },
    notifications: {
      email: true,
      push: true,
      weeklyReport: true,
      budgetAlerts: true,
    },
  });

  const [originalData, setOriginalData] = useState({});

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await userService.getProfile();
        const profileData = {
          name: response.user.name || '',
          email: response.user.email || '',
          currency: response.user.currency || 'USD',
          monthlyBudget: response.user.monthlyBudget || 0,
          preferences: {
            darkMode: colorMode === 'dark',
            compactView: false,
            defaultView: 'dashboard',
          },
          notifications: {
            email: true,
            push: true,
            weeklyReport: true,
            budgetAlerts: true,
          },
        };
        setUserData(profileData);
        setOriginalData(profileData);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [colorMode, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (key) => {
    setUserData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const handlePreferenceChange = (key) => {
    setUserData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: !prev.preferences[key]
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare profile data for API call
      const profileData = {
        name: userData.name,
        email: userData.email,
        currency: userData.currency,
        monthlyBudget: parseFloat(userData.monthlyBudget) || 0,
      };

      const response = await userService.updateProfile(profileData);
      
      // Update auth context with new user data
      updateUser(response.user);
      
      // Update original data to reflect saved changes
      setOriginalData({ ...userData });
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setUserData({ ...originalData });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Box>
        <Header />
        <Box display="flex">
          <Sidebar />
          <Box flex="1" p={6}>
            <Center height="400px">
              <Spinner size="xl" />
            </Center>
          </Box>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Header />
        <Box display="flex">
          <Sidebar />
          <Box flex="1" p={6}>
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Header />
      <Box display="flex">
        <Sidebar />
        <Box flex="1" p={6}>
          <HStack justify="space-between" mb={6}>
            <Heading size="lg">Settings</Heading>
            {isEditing ? (
              <HStack>
                <IconButton
                  icon={<FiX />}
                  onClick={handleCancel}
                  aria-label="Cancel"
                  isDisabled={saving}
                />
                <IconButton
                  icon={<FiSave />}
                  colorScheme="blue"
                  onClick={handleSave}
                  aria-label="Save"
                  isLoading={saving}
                  loadingText="Saving..."
                />
              </HStack>
            ) : (
              <IconButton
                icon={<FiEdit2 />}
                onClick={() => setIsEditing(true)}
                aria-label="Edit"
              />
            )}
          </HStack>

          <Tabs variant="enclosed">
            <TabList>
              <Tab>Profile</Tab>
              <Tab>Preferences</Tab>
              <Tab>Notifications</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <Card>
                  <CardBody>
                    <VStack spacing={6} align="stretch">
                      <HStack spacing={4}>
                        <Avatar size="xl" name={userData.name} />
                        {isEditing && (
                          <Button size="sm" isDisabled>Change Photo</Button>
                        )}
                      </HStack>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <FormControl isRequired>
                          <FormLabel>Name</FormLabel>
                          <Input
                            name="name"
                            value={userData.name}
                            onChange={handleInputChange}
                            isReadOnly={!isEditing}
                            placeholder="Enter your name"
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Email</FormLabel>
                          <Input
                            name="email"
                            type="email"
                            value={userData.email}
                            onChange={handleInputChange}
                            isReadOnly={!isEditing}
                            placeholder="Enter your email"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Currency</FormLabel>
                          <Select
                            name="currency"
                            value={userData.currency}
                            onChange={handleInputChange}
                            isDisabled={!isEditing}
                          >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="INR">INR (₹)</option>
                            <option value="CAD">CAD (C$)</option>
                            <option value="AUD">AUD (A$)</option>
                            <option value="JPY">JPY (¥)</option>
                          </Select>
                        </FormControl>

                        <FormControl>
                          <FormLabel>Monthly Budget</FormLabel>
                          <Input
                            name="monthlyBudget"
                            type="number"
                            value={userData.monthlyBudget}
                            onChange={handleInputChange}
                            isReadOnly={!isEditing}
                            placeholder="Enter monthly budget"
                            min="0"
                            step="0.01"
                          />
                        </FormControl>
                      </SimpleGrid>

                      {isEditing && (
                        <Alert status="info" borderRadius="md">
                          <AlertIcon />
                          <Text fontSize="sm">
                            Changes will be saved to your profile. Your currency setting affects how amounts are displayed throughout the app.
                          </Text>
                        </Alert>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>

              <TabPanel>
                <Card>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl display="flex" alignItems="center" justifyContent="space-between">
                        <FormLabel mb="0">Dark Mode</FormLabel>
                        <Switch
                          isChecked={userData.preferences.darkMode}
                          onChange={() => {
                            handlePreferenceChange('darkMode');
                            toggleColorMode();
                          }}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center" justifyContent="space-between">
                        <FormLabel mb="0">Compact View</FormLabel>
                        <Switch
                          isChecked={userData.preferences.compactView}
                          onChange={() => handlePreferenceChange('compactView')}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Default View</FormLabel>
                        <Select
                          name="defaultView"
                          value={userData.preferences.defaultView}
                          onChange={(e) => handlePreferenceChange('defaultView')}
                        >
                          <option value="dashboard">Dashboard</option>
                          <option value="expenses">Expenses</option>
                          <option value="budget">Budget</option>
                          <option value="reports">Reports</option>
                        </Select>
                      </FormControl>

                      <Alert status="warning" borderRadius="md">
                        <AlertIcon />
                        <Text fontSize="sm">
                          Preference changes are saved locally and will apply immediately.
                        </Text>
                      </Alert>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>

              <TabPanel>
                <Card>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl display="flex" alignItems="center" justifyContent="space-between">
                        <FormLabel mb="0">Email Notifications</FormLabel>
                        <Switch
                          isChecked={userData.notifications.email}
                          onChange={() => handleNotificationChange('email')}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center" justifyContent="space-between">
                        <FormLabel mb="0">Push Notifications</FormLabel>
                        <Switch
                          isChecked={userData.notifications.push}
                          onChange={() => handleNotificationChange('push')}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center" justifyContent="space-between">
                        <FormLabel mb="0">Weekly Reports</FormLabel>
                        <Switch
                          isChecked={userData.notifications.weeklyReport}
                          onChange={() => handleNotificationChange('weeklyReport')}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center" justifyContent="space-between">
                        <FormLabel mb="0">Budget Alerts</FormLabel>
                        <Switch
                          isChecked={userData.notifications.budgetAlerts}
                          onChange={() => handleNotificationChange('budgetAlerts')}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <Text fontSize="sm">
                          Notification preferences are stored locally. Email notifications require server-side implementation.
                        </Text>
                      </Alert>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    </Box>
  );
};

export default Settings; 