import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';

const Budget = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [budgets, setBudgets] = useState([
    {
      id: 1,
      category: 'Food',
      limit: 500,
      spent: 350,
      period: 'monthly',
    },
    {
      id: 2,
      category: 'Transport',
      limit: 200,
      spent: 120,
      period: 'monthly',
    },
    {
      id: 3,
      category: 'Entertainment',
      limit: 300,
      spent: 250,
      period: 'monthly',
    },
    {
      id: 4,
      category: 'Shopping',
      limit: 400,
      spent: 180,
      period: 'monthly',
    },
  ]);

  const [newBudget, setNewBudget] = useState({
    category: '',
    limit: '',
    period: 'monthly',
  });

  const categories = ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Other'];
  const periods = ['weekly', 'monthly', 'yearly'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBudget(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const budget = {
      id: budgets.length + 1,
      ...newBudget,
      limit: parseFloat(newBudget.limit),
      spent: 0,
    };
    setBudgets(prev => [...prev, budget]);
    setNewBudget({
      category: '',
      limit: '',
      period: 'monthly',
    });
    onClose();
  };

  const getProgressColor = (spent, limit) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 90) return 'red';
    if (percentage >= 75) return 'orange';
    return 'green';
  };

  const getStatusBadge = (spent, limit) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 90) return { color: 'red', text: 'Critical' };
    if (percentage >= 75) return { color: 'orange', text: 'Warning' };
    return { color: 'green', text: 'Good' };
  };

  return (
    <Box>
      <Header />
      <Box display="flex">
        <Sidebar />
        <Box flex="1" p={6}>
          <HStack justify="space-between" mb={6}>
            <Heading size="lg">Budget Management</Heading>
            <Button colorScheme="blue" onClick={onOpen}>
              Add Budget
            </Button>
          </HStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Budget</StatLabel>
                  <StatNumber>${budgets.reduce((acc, curr) => acc + curr.limit, 0)}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Across {budgets.length} categories
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Spent</StatLabel>
                  <StatNumber>${budgets.reduce((acc, curr) => acc + curr.spent, 0)}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" />
                    This month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Remaining</StatLabel>
                  <StatNumber>
                    ${budgets.reduce((acc, curr) => acc + (curr.limit - curr.spent), 0)}
                  </StatNumber>
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
                  <StatNumber>
                    {Math.round(
                      (budgets.reduce((acc, curr) => acc + (curr.spent / curr.limit), 0) / budgets.length) * 100
                    )}%
                  </StatNumber>
                  <StatHelpText>
                    Of budget limits
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {budgets.map((budget) => {
              const status = getStatusBadge(budget.spent, budget.limit);
              return (
                <Card key={budget.id}>
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <HStack justify="space-between">
                        <Heading size="md">{budget.category}</Heading>
                        <Badge colorScheme={status.color}>{status.text}</Badge>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text>${budget.spent} of ${budget.limit}</Text>
                        <Text color="gray.500" textTransform="capitalize">
                          {budget.period}
                        </Text>
                      </HStack>
                      
                      <Progress
                        value={(budget.spent / budget.limit) * 100}
                        colorScheme={getProgressColor(budget.spent, budget.limit)}
                        size="lg"
                        rounded="full"
                      />
                      
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.500">
                          {Math.round((budget.spent / budget.limit) * 100)}% used
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          ${budget.limit - budget.spent} remaining
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              );
            })}
          </SimpleGrid>

          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Add New Budget</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Category</FormLabel>
                      <Select
                        name="category"
                        value={newBudget.category}
                        onChange={handleInputChange}
                        placeholder="Select category"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Budget Limit</FormLabel>
                      <Input
                        type="number"
                        name="limit"
                        value={newBudget.limit}
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

                    <Button type="submit" colorScheme="blue" width="full">
                      Add Budget
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