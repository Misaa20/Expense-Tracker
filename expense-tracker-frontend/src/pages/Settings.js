import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { FiEdit2, FiSave, FiX } from 'react-icons/fi';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';

const Settings = () => {
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    currency: 'USD',
    language: 'English',
    notifications: {
      email: true,
      push: true,
      weeklyReport: true,
      budgetAlerts: true,
    },
    preferences: {
      darkMode: colorMode === 'dark',
      compactView: false,
      defaultView: 'dashboard',
    },
  });

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

  const handleSave = () => {
    // In a real app, this would make an API call to update the user's settings
    toast({
      title: 'Settings saved',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    setIsEditing(false);
  };

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
                  onClick={() => setIsEditing(false)}
                  aria-label="Cancel"
                />
                <IconButton
                  icon={<FiSave />}
                  colorScheme="blue"
                  onClick={handleSave}
                  aria-label="Save"
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
                          <Button size="sm">Change Photo</Button>
                        )}
                      </HStack>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <FormControl>
                          <FormLabel>Name</FormLabel>
                          <Input
                            name="name"
                            value={userData.name}
                            onChange={handleInputChange}
                            isReadOnly={!isEditing}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Email</FormLabel>
                          <Input
                            name="email"
                            value={userData.email}
                            onChange={handleInputChange}
                            isReadOnly={!isEditing}
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
                          </Select>
                        </FormControl>

                        <FormControl>
                          <FormLabel>Language</FormLabel>
                          <Select
                            name="language"
                            value={userData.language}
                            onChange={handleInputChange}
                            isDisabled={!isEditing}
                          >
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                            <option value="German">German</option>
                          </Select>
                        </FormControl>
                      </SimpleGrid>
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
                          isDisabled={!isEditing}
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center" justifyContent="space-between">
                        <FormLabel mb="0">Compact View</FormLabel>
                        <Switch
                          isChecked={userData.preferences.compactView}
                          onChange={() => handlePreferenceChange('compactView')}
                          isDisabled={!isEditing}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Default View</FormLabel>
                        <Select
                          name="defaultView"
                          value={userData.preferences.defaultView}
                          onChange={handleInputChange}
                          isDisabled={!isEditing}
                        >
                          <option value="dashboard">Dashboard</option>
                          <option value="expenses">Expenses</option>
                          <option value="budget">Budget</option>
                          <option value="reports">Reports</option>
                        </Select>
                      </FormControl>
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
                          isDisabled={!isEditing}
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center" justifyContent="space-between">
                        <FormLabel mb="0">Push Notifications</FormLabel>
                        <Switch
                          isChecked={userData.notifications.push}
                          onChange={() => handleNotificationChange('push')}
                          isDisabled={!isEditing}
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center" justifyContent="space-between">
                        <FormLabel mb="0">Weekly Reports</FormLabel>
                        <Switch
                          isChecked={userData.notifications.weeklyReport}
                          onChange={() => handleNotificationChange('weeklyReport')}
                          isDisabled={!isEditing}
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center" justifyContent="space-between">
                        <FormLabel mb="0">Budget Alerts</FormLabel>
                        <Switch
                          isChecked={userData.notifications.budgetAlerts}
                          onChange={() => handleNotificationChange('budgetAlerts')}
                          isDisabled={!isEditing}
                        />
                      </FormControl>
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