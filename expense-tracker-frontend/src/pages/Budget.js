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
  IconButton,
  Tooltip,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { budgetService } from '../services/budgets';

const Budget = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingBudget, setDeletingBudget] = useState(null);
  const cancelRef = React.useRef();

  const [newBudget, setNewBudget] = useState({
    name: '',
    amount: '',
    period: 'monthly',
    startDate: '',
    endDate: '',
    alertThreshold: 80,
    categories: [],
  });

  const [editBudget, setEditBudget] = useState({
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

  const handleInputChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    if (isEdit) {
      setEditBudget(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setNewBudget(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCategoryChange = (categoryId, amount, isEdit = false) => {
    const setter = isEdit ? setEditBudget : setNewBudget;
    
    setter(prev => {
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

  const handleEdit = async (budget) => {
    console.log('Editing budget:', budget);
    
    // Check if budget is valid
    if (!budget || !budget._id) {
      console.error('Invalid budget object:', budget);
      toast({
        title: 'Error',
        description: 'Invalid budget data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setEditingBudget(budget);
    setEditBudget({
      name: budget.name || '',
      amount: budget.amount ? budget.amount.toString() : '',
      period: budget.period || 'monthly',
      startDate: budget.startDate ? new Date(budget.startDate).toISOString().split('T')[0] : '',
      endDate: budget.endDate ? new Date(budget.endDate).toISOString().split('T')[0] : '',
      alertThreshold: budget.alertThreshold || 80,
      categories: budget.categories || [],
    });
    onEditOpen();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!editingBudget?._id) {
      toast({
        title: 'Error',
        description: 'No budget selected for editing',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }

    try {
      const budgetData = {
        ...editBudget,
        amount: parseFloat(editBudget.amount),
        alertThreshold: parseFloat(editBudget.alertThreshold),
        startDate: new Date(editBudget.startDate).toISOString(),
        endDate: new Date(editBudget.endDate).toISOString(),
      };

      const response = await budgetService.updateBudget(editingBudget._id, budgetData);
      
      setBudgets(prev => 
        prev.map(budget => budget._id === editingBudget._id ? response.budget : budget)
      );
      
      toast({
        title: 'Budget updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onEditClose();
      setEditingBudget(null);
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: 'Error updating budget',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (budget) => {
    console.log('Deleting budget:', budget);
    
    if (!budget || !budget._id) {
      console.error('Invalid budget object:', budget);
      toast({
        title: 'Error',
        description: 'Invalid budget data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setDeletingBudget(budget);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    if (!deletingBudget?._id) {
      toast({
        title: 'Error',
        description: 'No budget selected for deletion',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Deleting budget ID:', deletingBudget._id);
      await budgetService.deleteBudget(deletingBudget._id);
      
      setBudgets(prev => prev.filter(budget => budget._id !== deletingBudget._id));
      
      toast({
        title: 'Budget deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onDeleteClose();
      setDeletingBudget(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error deleting budget',
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
                            <HStack>
                              <Badge colorScheme={status.color}>{status.text}</Badge>
                              <HStack spacing={1}>
                                <Tooltip label="Edit budget">
                                  <IconButton
                                    icon={<FiEdit2 />}
                                    size="sm"
                                    colorScheme="blue"
                                    variant="ghost"
                                    onClick={() => handleEdit(budget)}
                                    isLoading={loading}
                                  />
                                </Tooltip>
                                <Tooltip label="Delete budget">
                                  <IconButton
                                    icon={<FiTrash2 />}
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() => handleDeleteClick(budget)}
                                    isLoading={loading}
                                  />
                                </Tooltip>
                              </HStack>
                            </HStack>
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

          {/* Add Budget Modal */}
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

          {/* Edit Budget Modal */}
          <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Edit Budget</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <form onSubmit={handleUpdate}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Budget Name</FormLabel>
                      <Input
                        name="name"
                        value={editBudget.name}
                        onChange={(e) => handleInputChange(e, true)}
                        placeholder="Enter budget name"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Budget Amount</FormLabel>
                      <Input
                        type="number"
                        name="amount"
                        value={editBudget.amount}
                        onChange={(e) => handleInputChange(e, true)}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Period</FormLabel>
                      <Select
                        name="period"
                        value={editBudget.period}
                        onChange={(e) => handleInputChange(e, true)}
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
                          value={editBudget.startDate}
                          onChange={(e) => handleInputChange(e, true)}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>End Date</FormLabel>
                        <Input
                          type="date"
                          name="endDate"
                          value={editBudget.endDate}
                          onChange={(e) => handleInputChange(e, true)}
                        />
                      </FormControl>
                    </HStack>

                    <FormControl>
                      <FormLabel>Alert Threshold (%)</FormLabel>
                      <Input
                        type="number"
                        name="alertThreshold"
                        value={editBudget.alertThreshold}
                        onChange={(e) => handleInputChange(e, true)}
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
                        {categories.map((category) => {
                          const existingCategory = editBudget.categories.find(cat => cat.category === category._id);
                          return (
                            <HStack key={category._id}>
                              <Text flex="1" fontSize="sm">{category.name}</Text>
                              <Input
                                type="number"
                                placeholder="Amount"
                                step="0.01"
                                w="120px"
                                size="sm"
                                defaultValue={existingCategory?.amount || ''}
                                onChange={(e) => handleCategoryChange(category._id, e.target.value, true)}
                              />
                            </HStack>
                          );
                        })}
                      </VStack>
                    </FormControl>

                    <HStack spacing={4} width="full">
                      <Button 
                        type="button" 
                        variant="outline" 
                        width="full"
                        onClick={onEditClose}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        colorScheme="blue" 
                        width="full"
                        isLoading={loading}
                        loadingText="Updating..."
                      >
                        Update Budget
                      </Button>
                    </HStack>
                  </VStack>
                </form>
              </ModalBody>
            </ModalContent>
          </Modal>

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            isOpen={isDeleteOpen}
            leastDestructiveRef={cancelRef}
            onClose={onDeleteClose}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Delete Budget
                </AlertDialogHeader>

                <AlertDialogBody>
                  Are you sure you want to delete "{deletingBudget?.name}"? 
                  This action cannot be undone.
                </AlertDialogBody>

                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={onDeleteClose}>
                    Cancel
                  </Button>
                  <Button 
                    colorScheme="red" 
                    onClick={handleDelete} 
                    ml={3}
                    isLoading={loading}
                    loadingText="Deleting..."
                  >
                    Delete
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </Box>
      </Box>
    </Box>
  );
};

export default Budget; 