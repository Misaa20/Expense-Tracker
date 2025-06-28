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
} from '@chakra-ui/react';
import { expenseService } from '../services/expenses';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { useAuth } from '../context/AuthContext';

const Expenses = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);

  const [newExpense, setNewExpense] = useState({
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
        setExpenses(data.expenses);
      } catch (error) {
        toast({
          title: 'Error fetching expenses',
          description: error.message || 'Could not retrieve expenses.',
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense(prev => ({
      ...prev,
      [name]: value
    }));
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

  const getCategoryColor = (category) => {
    const colors = {
      Food: 'green',
      Transport: 'blue',
      Entertainment: 'purple',
      Bills: 'red',
      Shopping: 'orange',
      Other: 'gray'
    };
    return colors[category] || 'gray';
  };

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

          <Box bg="white" rounded="lg" shadow="sm" overflow="hidden">
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Date</Th>
                  <Th>Category</Th>
                  <Th>Description</Th>
                  <Th>Payment Method</Th>
                  <Th isNumeric>Amount</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan="5">
                      <Center p={10}>
                        <Spinner />
                      </Center>
                    </Td>
                  </Tr>
                ) : (
                  expenses.map((expense) => (
                    <Tr key={expense._id}>
                      <Td>{new Date(expense.date).toLocaleDateString()}</Td>
                      <Td>
                        <Badge colorScheme={getCategoryColor(expense.category?.name)}>
                          {expense.category?.name || 'Uncategorized'}
                        </Badge>
                      </Td>
                      <Td>{expense.title}</Td>
                      <Td>{expense.paymentMethod}</Td>
                      <Td isNumeric>${expense.amount.toFixed(2)}</Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>

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

                    <FormControl isRequired>
                      <FormLabel>Payment Method</FormLabel>
                      <Select
                        name="paymentMethod"
                        value={newExpense.paymentMethod}
                        onChange={handleInputChange}
                      >
                        {paymentMethods.map((method) => (
                          <option key={method} value={method}>
                            {method.charAt(0).toUpperCase() + method.slice(1)}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Description</FormLabel>
                      <Input
                        name="description"
                        value={newExpense.description}
                        onChange={handleInputChange}
                        placeholder="Enter description"
                      />
                    </FormControl>

                    <Button
                      mt={4}
                      colorScheme="blue"
                      isLoading={loading}
                      type="submit"
                    >
                      Add Expense
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

export default Expenses; 