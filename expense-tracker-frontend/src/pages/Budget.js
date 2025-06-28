import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Progress,
  Text,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Badge,
  useToast,
  Spinner,
  Center,
  Stack,
} from '@chakra-ui/react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { budgetService } from '../services/budgets';

const Budget = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);

  const [newBudget, setNewBudget] = useState({
    name: '',
    amount: '',
    period: 'monthly',
    startDate: '',
    endDate: '',
    alertThreshold: 80,
    categories: [],
  });

  // Fetch budgets on component mount
  useEffect(() => {
    const fetchBudgets = async () => {
      setLoading(true);
      try {
        console.log('Fetching budgets from API...');
        const data = await budgetService.getBudgets();
        console.log('Budgets data received:', data);
        setBudgets(data.budgets || []);
      } catch (error) {
        console.error('Error fetching budgets:', error);
        toast({
          title: 'Error fetching budgets',
          description: error.response?.data?.message || 'Could not retrieve budgets from server.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchBudgets();
  }, [toast]);

  // Hardcoded categories for now (you can create a category API later)
  useEffect(() => {
    setCategories([
      { _id: '60d0fe4f5311236168a109ca', name: 'Food & Dining' },
      { _id: '60d0fe4f5311236168a109cb', name: 'Transportation' },
      { _id: '60d0fe4f5311236168a109cc', name: 'Entertainment' },
      { _id: '60d0fe4f5311236168a109cd', name: 'Bills & Utilities' },
      { _id: '60d0fe4f5311236168a109ce', name: 'Shopping' },
      { _id: '60d0fe4f5311236168a109cf', name: 'Healthcare' },
      { _id: '60d0fe4f5311236168a109d0', name: 'Education' },
      { _id: '60d0fe4f5311236168a109d1', name: 'Other' },
    ]);
  }, []);

  const periods = ['weekly', 'monthly', 'yearly'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBudget(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (categoryId, amount) => {
    setNewBudget(prev => {
      const existingIndex = prev.categories.findIndex(cat => cat.category === categoryId);
      const newCategories = [...prev.categories];
      
      if (existingIndex >= 0) {
        if (amount > 0) {
          newCategories[existingIndex].amount = parseFloat(amount);
        } else {
          newCategories.splice(existingIndex, 1);
        }
      } else if (amount > 0) {
        newCategories.push({
          category: categoryId,
          amount: parseFloat(amount)
        });
      }
      
      return {
        ...prev,
        categories: newCategories
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Creating budget with data:', newBudget);
      
      const budgetData = {
        ...newBudget,
        amount: parseFloat(newBudget.amount),
        alertThreshold: parseFloat(newBudget.alertThreshold),
        startDate: new Date(newBudget.startDate).toISOString(),
        endDate: new Date(newBudget.endDate).toISOString(),
      };

      const response = await budgetService.createBudget(budgetData);
      console.log('Budget created:', response);
      
      setBudgets(prev => [...prev, response.budget]);
      
      toast({
        title: 'Budget created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setNewBudget({
        name: '',
        amount: '',
        period: 'monthly',
        startDate: '',
        endDate: '',
        alertThreshold: 80,
        categories: [],
      });
      onClose();
    } catch (error) {
      console.error('Error creating budget:', error);
      toast({
        title: 'Error creating budget',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progressPercentage) => {
    if (progressPercentage >= 90) return 'red';
    if (progressPercentage >= 75) return 'orange';
    return 'green';
  };

  const getStatusBadge = (progressPercentage) => {
    if (progressPercentage >= 90) return { color: 'red', text: 'Critical' };
    if (progressPercentage >= 75) return { color: 'orange', text: 'Warning' };
    return { color: 'green', text: 'Good' };
  };

  // Calculate totals from real budget data
  const totalBudget = budgets.reduce((acc, curr) => acc + curr.amount, 0);
  const totalSpent = budgets.reduce((acc, curr) => acc + (curr.spentAmount || 0), 0);
  const totalRemaining = budgets.reduce((acc, curr) => acc + (curr.remainingAmount || 0), 0);
  const averageUsage = budgets.length > 0 
    ? budgets.reduce((acc, curr) => acc + (curr.progressPercentage || 0), 0) / budgets.length
    : 0;

  if (loading && budgets.length === 0) {
    return (
      <Box>
        <Header />
        <Box display="flex">
          <Sidebar />
          <Box flex="1" p={6}>
            <Center h="200px">
              <VStack>
                <Spinner size="xl" />
                <Text>Loading budgets...</Text>
              </VStack>
            </Center>
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
            <Heading size="lg">Budget Management</Heading>
            <Button colorScheme="blue" onClick={onOpen} isLoading={loading}>
              Add Budget
            </Button>
          </HStack>

          {budgets.length === 0 ? (
            <Center p={8}>
              <VStack>
                <Text fontSize="lg" color="gray.500">No budgets found</Text>
                <Text fontSize="sm" color="gray.400">Create your first budget to get started</Text>
                <Button colorScheme="blue" onClick={onOpen} mt={4}>
                  Create Budget
                </Button>
              </VStack>
            </Center>
          ) : (
            <>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
                <Card>
                  <CardBody>
                    <Stat>
                      <StatLabel>Total Budget</StatLabel>
                      <StatNumber>${totalBudget.toFixed(2)}</StatNumber>
                      <StatHelpText>
                        <StatArrow type="increase" />
                        Across {budgets.length} budgets
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <Stat>
                      <StatLabel>Total Spent</StatLabel>
                      <StatNumber>${totalSpent.toFixed(2)}</StatNumber>
                      <StatHelpText>
                        <StatArrow type="decrease" />
                        This period
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <Stat>
                      <StatLabel>Remaining</StatLabel>
                      <StatNumber>${totalRemaining.toFixed(2)}</StatNumber>
                      <StatHelpText>
                        Available to spend
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <Stat>
                      <StatLabel>Average Usage</StatLabel>
                      <StatNumber>{Math.round(averageUsage)}%</StatNumber>
                      <StatHelpText>
                        Of budget limits
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {budgets.map((budget) => {
                  const status = getStatusBadge(budget.progressPercentage || 0);
                  return (
                    <Card key={budget._id}>
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <HStack justify="space-between">
                            <Heading size="md">{budget.name}</Heading>
                            <Badge colorScheme={status.color}>{status.text}</Badge>
                          </HStack>
                          
                          <HStack justify="space-between">
                            <Text>${(budget.spentAmount || 0).toFixed(2)} of ${budget.amount.toFixed(2)}</Text>
                            <Text color="gray.500" textTransform="capitalize">
                              {budget.period}
                            </Text>
                          </HStack>
                          
                          <Progress
                            value={budget.progressPercentage || 0}
                            colorScheme={getProgressColor(budget.progressPercentage || 0)}
                            size="lg"
                            rounded="full"
                          />
                          
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.500">
                              {Math.round(budget.progressPercentage || 0)}% used
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              ${(budget.remainingAmount || 0).toFixed(2)} remaining
                            </Text>
                          </HStack>

                          {budget.categories && budget.categories.length > 0 && (
                            <Box>
                              <Text fontSize="sm" fontWeight="semibold" mb={2}>Categories:</Text>
                              <Stack spacing={1}>
                                {budget.categories.map((cat, index) => (
                                  <Text key={index} fontSize="sm" color="gray.600">
                                    {cat.category?.name || 'Unknown'}: ${cat.amount.toFixed(2)}
                                  </Text>
                                ))}
                              </Stack>
                            </Box>
                          )}

                          <Text fontSize="xs" color="gray.400">
                            {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </>
          )}

          <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Add New Budget</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Budget Name</FormLabel>
                      <Input
                        name="name"
                        value={newBudget.name}
                        onChange={handleInputChange}
                        placeholder="Enter budget name"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Budget Amount</FormLabel>
                      <Input
                        type="number"
                        name="amount"
                        value={newBudget.amount}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Period</FormLabel>
                      <Select
                        name="period"
                        value={newBudget.period}
                        onChange={handleInputChange}
                      >
                        {periods.map((period) => (
                          <option key={period} value={period}>
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <HStack w="full" spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>Start Date</FormLabel>
                        <Input
                          type="date"
                          name="startDate"
                          value={newBudget.startDate}
                          onChange={handleInputChange}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>End Date</FormLabel>
                        <Input
                          type="date"
                          name="endDate"
                          value={newBudget.endDate}
                          onChange={handleInputChange}
                        />
                      </FormControl>
                    </HStack>

                    <FormControl>
                      <FormLabel>Alert Threshold (%)</FormLabel>
                      <Input
                        type="number"
                        name="alertThreshold"
                        value={newBudget.alertThreshold}
                        onChange={handleInputChange}
                        placeholder="80"
                        min="0"
                        max="100"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Categories (Optional)</FormLabel>
                      <Text fontSize="sm" color="gray.500" mb={3}>
                        Specify amounts for specific categories. Leave empty to track all expenses.
                      </Text>
                      <VStack align="stretch" spacing={2}>
                        {categories.map((category) => (
                          <HStack key={category._id}>
                            <Text flex="1" fontSize="sm">{category.name}</Text>
                            <Input
                              type="number"
                              placeholder="Amount"
                              step="0.01"
                              w="120px"
                              size="sm"
                              onChange={(e) => handleCategoryChange(category._id, e.target.value)}
                            />
                          </HStack>
                        ))}
                      </VStack>
                    </FormControl>

                    <Button 
                      type="submit" 
                      colorScheme="blue" 
                      width="full"
                      isLoading={loading}
                      loadingText="Creating..."
                    >
                      Create Budget
                    </Button>
                  </VStack>
                </form>
              </ModalBody>
            </ModalContent>
          </Modal>
        </Box>
      </Box>
    </Box>
  );
};

export default Budget; 