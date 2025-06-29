import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
  Text,
  Badge,
  useToast,
  Spinner,
  Center,
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
import { expenseService } from '../services/expenses';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { useAuth } from '../context/AuthContext';

const Expenses = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const toast = useToast();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const cancelRef = React.useRef();

  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    description: '',
    category: '',
    date: '',
    paymentMethod: 'card',
    tags: [],
  });

  const [editExpense, setEditExpense] = useState({
    title: '',
    amount: '',
    description: '',
    category: '',
    date: '',
    paymentMethod: 'card',
    tags: [],
  });

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const data = await expenseService.getExpenses();
        console.log('Fetched expenses:', data.expenses);
        setExpenses(data.expenses);
      } catch (error) {
        console.error('Error fetching expenses:', error);
        toast({
          title: 'Error fetching expenses',
          description: error.response?.data?.message || 'Could not retrieve expenses.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [toast]);

  useEffect(() => {
    const fetchCategories = async () => {
      setCategories([
        { _id: '60d0fe4f5311236168a109ca', name: 'Food' },
        { _id: '60d0fe4f5311236168a109cb', name: 'Transport' },
        { _id: '60d0fe4f5311236168a109cc', name: 'Entertainment' },
        { _id: '60d0fe4f5311236168a109cd', name: 'Bills' },
        { _id: '60d0fe4f5311236168a109ce', name: 'Shopping' },
        { _id: '60d0fe4f5311236168a109cf', name: 'Other' },
      ]);
    };

    fetchCategories();
  }, [toast]);

  const paymentMethods = ['card', 'cash', 'bank_transfer', 'other'];

  const handleInputChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    if (isEdit) {
      setEditExpense(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setNewExpense(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!newExpense.category) {
      toast({
        title: 'Validation Error',
        description: 'Please select a category.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }

    try {
      const response = await expenseService.createExpense({
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date ? new Date(newExpense.date).toISOString() : new Date().toISOString(),
        tags: newExpense.tags.length > 0 ? newExpense.tags.map(t => t.trim()) : [],
      });

      setExpenses(prev => [...prev, response.expense]);
      
      toast({
        title: 'Expense added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setNewExpense({
        title: '',
        amount: '',
        description: '',
        category: '',
        date: '',
        paymentMethod: 'card',
        tags: [],
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error adding expense',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (expense) => {
    console.log('Editing expense:', expense);
    
    // Check if expense is valid
    if (!expense || !expense._id) {
      console.error('Invalid expense object:', expense);
      toast({
        title: 'Error',
        description: 'Invalid expense data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setEditingExpense(expense);
    setEditExpense({
      title: expense.title || '',
      amount: expense.amount ? expense.amount.toString() : '',
      description: expense.description || '',
      category: expense.category?._id || '',
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
      paymentMethod: expense.paymentMethod || 'card',
      tags: expense.tags || [],
    });
    onEditOpen();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!editingExpense?._id) {
      toast({
        title: 'Error',
        description: 'No expense selected for editing',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }

    try {
      const response = await expenseService.updateExpense(editingExpense._id, {
        ...editExpense,
        amount: parseFloat(editExpense.amount),
        date: new Date(editExpense.date).toISOString(),
        tags: editExpense.tags.length > 0 ? editExpense.tags.map(t => t.trim()) : [],
      });

      setExpenses(prev => 
        prev.map(exp => exp._id === editingExpense._id ? response.expense : exp)
      );
      
      toast({
        title: 'Expense updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onEditClose();
      setEditingExpense(null);
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: 'Error updating expense',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (expense) => {
    console.log('Deleting expense:', expense);
    
    if (!expense || !expense._id) {
      console.error('Invalid expense object:', expense);
      toast({
        title: 'Error',
        description: 'Invalid expense data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setDeletingExpense(expense);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    if (!deletingExpense?._id) {
      toast({
        title: 'Error',
        description: 'No expense selected for deletion',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Deleting expense ID:', deletingExpense._id);
      await expenseService.deleteExpense(deletingExpense._id);
      
      setExpenses(prev => prev.filter(exp => exp._id !== deletingExpense._id));
      
      toast({
        title: 'Expense deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onDeleteClose();
      setDeletingExpense(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error deleting expense',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (categoryName) => {
    const colors = {
      Food: 'green',
      Transport: 'blue',
      Entertainment: 'purple',
      Bills: 'red',
      Shopping: 'orange',
      Other: 'gray'
    };
    return colors[categoryName] || 'gray';
  };

  if (loading && expenses.length === 0) {
    return (
      <Box>
        <Header />
        <Box display="flex">
          <Sidebar />
          <Box flex="1" p={6}>
            <Center h="200px">
              <VStack>
                <Spinner size="xl" />
                <Text>Loading expenses...</Text>
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
            <Heading size="lg">Expenses</Heading>
            <Button colorScheme="blue" onClick={onOpen}>
              Add Expense
            </Button>
          </HStack>

          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Title</Th>
                  <Th>Amount</Th>
                  <Th>Category</Th>
                  <Th>Date</Th>
                  <Th>Payment Method</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {expenses.map((expense) => (
                  <Tr key={expense._id}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="semibold">{expense.title}</Text>
                        {expense.description && (
                          <Text fontSize="sm" color="gray.500">
                            {expense.description}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <Text fontWeight="bold">${expense.amount.toFixed(2)}</Text>
                    </Td>
                    <Td>
                      <Badge colorScheme={getCategoryColor(expense.category?.name)}>
                        {expense.category?.name || 'No Category'}
                      </Badge>
                    </Td>
                    <Td>{new Date(expense.date).toLocaleDateString()}</Td>
                    <Td>
                      <Text textTransform="capitalize">
                        {expense.paymentMethod?.replace('_', ' ') || 'N/A'}
                      </Text>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Tooltip label="Edit expense">
                          <IconButton
                            icon={<FiEdit2 />}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => handleEdit(expense)}
                            isLoading={loading}
                          />
                        </Tooltip>
                        <Tooltip label="Delete expense">
                          <IconButton
                            icon={<FiTrash2 />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDeleteClick(expense)}
                            isLoading={loading}
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {/* Add Expense Modal */}
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Add New Expense</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Title</FormLabel>
                      <Input
                        name="title"
                        value={newExpense.title}
                        onChange={handleInputChange}
                        placeholder="Enter expense title"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Amount</FormLabel>
                      <Input
                        type="number"
                        name="amount"
                        value={newExpense.amount}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Description</FormLabel>
                      <Input
                        name="description"
                        value={newExpense.description}
                        onChange={handleInputChange}
                        placeholder="Enter description (optional)"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Date</FormLabel>
                      <Input
                        type="date"
                        name="date"
                        value={newExpense.date}
                        onChange={handleInputChange}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Category</FormLabel>
                      <Select
                        name="category"
                        value={newExpense.category}
                        onChange={handleInputChange}
                        placeholder="Select category"
                      >
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Payment Method</FormLabel>
                      <Select
                        name="paymentMethod"
                        value={newExpense.paymentMethod}
                        onChange={handleInputChange}
                      >
                        {paymentMethods.map((method) => (
                          <option key={method} value={method}>
                            {method.replace('_', ' ').charAt(0).toUpperCase() + method.replace('_', ' ').slice(1)}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <Button 
                      type="submit" 
                      colorScheme="blue" 
                      width="full"
                      isLoading={loading}
                      loadingText="Adding..."
                    >
                      Add Expense
                    </Button>
                  </VStack>
                </form>
              </ModalBody>
            </ModalContent>
          </Modal>

          {/* Edit Expense Modal */}
          <Modal isOpen={isEditOpen} onClose={onEditClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Edit Expense</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <form onSubmit={handleUpdate}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Title</FormLabel>
                      <Input
                        name="title"
                        value={editExpense.title}
                        onChange={(e) => handleInputChange(e, true)}
                        placeholder="Enter expense title"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Amount</FormLabel>
                      <Input
                        type="number"
                        name="amount"
                        value={editExpense.amount}
                        onChange={(e) => handleInputChange(e, true)}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Description</FormLabel>
                      <Input
                        name="description"
                        value={editExpense.description}
                        onChange={(e) => handleInputChange(e, true)}
                        placeholder="Enter description (optional)"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Date</FormLabel>
                      <Input
                        type="date"
                        name="date"
                        value={editExpense.date}
                        onChange={(e) => handleInputChange(e, true)}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Category</FormLabel>
                      <Select
                        name="category"
                        value={editExpense.category}
                        onChange={(e) => handleInputChange(e, true)}
                        placeholder="Select category"
                      >
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Payment Method</FormLabel>
                      <Select
                        name="paymentMethod"
                        value={editExpense.paymentMethod}
                        onChange={(e) => handleInputChange(e, true)}
                      >
                        {paymentMethods.map((method) => (
                          <option key={method} value={method}>
                            {method.replace('_', ' ').charAt(0).toUpperCase() + method.replace('_', ' ').slice(1)}
                          </option>
                        ))}
                      </Select>
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
                        Update Expense
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
                  Delete Expense
                </AlertDialogHeader>

                <AlertDialogBody>
                  Are you sure you want to delete "{deletingExpense?.title}"? 
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

export default Expenses; 