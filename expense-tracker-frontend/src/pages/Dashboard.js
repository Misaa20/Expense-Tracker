import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Spinner,
  Center,
  VStack,
  useToast,
  Alert,
  AlertIcon,
  StatArrow,
  Badge,
  HStack,
  Divider,
} from '@chakra-ui/react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Card from '../components/ui/Card';
import ExpenseChart from '../components/charts/ExpenseChart';
import { expenseService } from '../services/expenses';
import { budgetService } from '../services/budgets';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const toast = useToast();

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        console.log('Fetching dashboard data...');
        
        const [expensesResponse, statsResponse, budgetsResponse] = await Promise.all([
          expenseService.getExpenses({ limit: 100 }), // Get more expenses for better analytics
          expenseService.getExpenseStats('month'),
          budgetService.getBudgets()
        ]);

        console.log('Dashboard data fetched:', {
          expenses: expensesResponse.expenses?.length,
          stats: statsResponse.stats,
          budgets: budgetsResponse.budgets?.length
        });

        setExpenses(expensesResponse.expenses || []);
        setStatsData(statsResponse.stats);
        setBudgets(budgetsResponse.budgets || []);
        
        // Get recent expenses (last 5)
        const recent = (expensesResponse.expenses || [])
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
        setRecentExpenses(recent);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error loading dashboard',
          description: error.response?.data?.message || 'Could not load dashboard data.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  // Process expense data for charts
  const getExpenseChartData = () => {
    if (!statsData?.categoryBreakdown || statsData.categoryBreakdown.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'Expenses',
          data: [1],
          backgroundColor: ['rgba(200, 200, 200, 0.8)'],
        }]
      };
    }

    const colors = [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 205, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)',
      'rgba(255, 159, 64, 0.8)',
      'rgba(201, 203, 207, 0.8)',
      'rgba(255, 99, 255, 0.8)',
    ];

    return {
      labels: statsData.categoryBreakdown.map(cat => cat.name),
      datasets: [{
        label: 'Expenses',
        data: statsData.categoryBreakdown.map(cat => cat.total),
        backgroundColor: colors.slice(0, statsData.categoryBreakdown.length),
      }]
    };
  };

  // Calculate dynamic statistics
  const getCalculatedStats = () => {
    const totalExpenses = statsData?.totalExpenses || 0;
    const totalTransactions = statsData?.totalTransactions || 0;
    
    // Calculate total budget and remaining budget
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + (budget.spentAmount || 0), 0);
    const remainingBudget = totalBudget - totalSpent;
    
    // Calculate average expense
    const avgExpense = totalTransactions > 0 ? totalExpenses / totalTransactions : 0;
    
    // Get active budgets count
    const activeBudgets = budgets.filter(budget => budget.isActive !== false).length;
    
    return [
      {
        label: 'Total Expenses',
        value: `$${totalExpenses.toFixed(2)}`,
        change: `${totalTransactions} transactions`,
        isPositive: true,
        color: 'blue'
      },
      {
        label: 'Total Budget',
        value: `$${totalBudget.toFixed(2)}`,
        change: `${activeBudgets} active budgets`,
        isPositive: true,
        color: 'green'
      },
      {
        label: 'Remaining Budget',
        value: `$${remainingBudget.toFixed(2)}`,
        change: remainingBudget >= 0 ? 'Within budget' : 'Over budget',
        isPositive: remainingBudget >= 0,
        color: remainingBudget >= 0 ? 'green' : 'red'
      },
      {
        label: 'Avg. Expense',
        value: `$${avgExpense.toFixed(2)}`,
        change: 'per transaction',
        isPositive: true,
        color: 'purple'
      },
    ];
  };

  if (loading) {
    return (
      <Box>
        <Header />
        <Flex>
          <Sidebar />
          <Box flex={1} p={6} bg="gray.50">
            <Center h="400px">
              <VStack>
                <Spinner size="xl" />
                <Text>Loading dashboard...</Text>
              </VStack>
            </Center>
          </Box>
        </Flex>
      </Box>
    );
  }

  const stats = getCalculatedStats();
  const expenseData = getExpenseChartData();

  return (
    <Box>
      <Header />
      <Flex>
        <Sidebar />
        <Box flex={1} p={6} bg="gray.50">
          <HStack justify="space-between" mb={6}>
            <Text fontSize="2xl" fontWeight="bold">
              Dashboard
            </Text>
            <Badge colorScheme="green" p={2} borderRadius="md">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Badge>
          </HStack>

          {expenses.length === 0 && (
            <Alert status="info" mb={6}>
              <AlertIcon />
              Welcome! Add your first expense to see meaningful dashboard insights.
            </Alert>
          )}
          
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6} mb={6}>
            {stats.map((stat, index) => (
              <GridItem key={index}>
                <Card>
                  <Stat>
                    <StatLabel color="gray.600">{stat.label}</StatLabel>
                    <StatNumber color={`${stat.color}.500`} fontSize={{ base: 'lg', md: 'xl' }}>
                      {stat.value}
                    </StatNumber>
                    <StatHelpText color={stat.isPositive ? 'green.500' : 'red.500'}>
                      <StatArrow type={stat.isPositive ? 'increase' : 'decrease'} />
                      {stat.change}
                    </StatHelpText>
                  </Stat>
                </Card>
              </GridItem>
            ))}
          </Grid>

          <Grid templateColumns={{ base: '1fr', xl: 'repeat(3, 1fr)' }} gap={6} mb={6}>
            {/* Bar Chart */}
            <GridItem colSpan={{ base: 1, xl: 1 }}>
              <ExpenseChart data={expenseData} type="bar" />
            </GridItem>

            {/* Doughnut Chart */}
            <GridItem colSpan={{ base: 1, xl: 1 }}>
              <ExpenseChart data={expenseData} type="doughnut" />
            </GridItem>

            {/* Recent Expenses */}
            <GridItem colSpan={{ base: 1, xl: 1 }}>
              <Card>
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                  Recent Expenses
                </Text>
                {recentExpenses.length === 0 ? (
                  <Text color="gray.500" textAlign="center" py={8}>
                    No recent expenses
                  </Text>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {recentExpenses.map((expense, index) => (
                      <Box key={expense._id}>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium" fontSize="sm">
                              {expense.title}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {expense.category?.name || 'No Category'}
                            </Text>
                          </VStack>
                          <VStack align="end" spacing={0}>
                            <Text fontWeight="bold" color="red.500">
                              -${expense.amount.toFixed(2)}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {new Date(expense.date).toLocaleDateString()}
                            </Text>
                          </VStack>
                        </HStack>
                        {index < recentExpenses.length - 1 && <Divider mt={3} />}
                      </Box>
                    ))}
                  </VStack>
                )}
              </Card>
            </GridItem>
          </Grid>

          {/* Budget Overview */}
          {budgets.length > 0 && (
            <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }} gap={6}>
              {budgets.slice(0, 3).map((budget) => (
                <GridItem key={budget._id}>
                  <Card>
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between">
                        <Text fontWeight="semibold" fontSize="md">
                          {budget.name}
                        </Text>
                        <Badge 
                          colorScheme={
                            (budget.progressPercentage || 0) >= 90 ? 'red' : 
                            (budget.progressPercentage || 0) >= 75 ? 'orange' : 'green'
                          }
                        >
                          {Math.round(budget.progressPercentage || 0)}%
                        </Badge>
                      </HStack>
                      
                      <Box>
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="sm" color="gray.600">
                            ${(budget.spentAmount || 0).toFixed(2)} of ${budget.amount.toFixed(2)}
                          </Text>
                        </HStack>
                        <Box bg="gray.200" borderRadius="full" h={2}>
                          <Box
                            bg={
                              (budget.progressPercentage || 0) >= 90 ? 'red.500' : 
                              (budget.progressPercentage || 0) >= 75 ? 'orange.500' : 'green.500'
                            }
                            h={2}
                            borderRadius="full"
                            w={`${Math.min(budget.progressPercentage || 0, 100)}%`}
                          />
                        </Box>
                      </Box>
                      
                      <Text fontSize="xs" color="gray.500" textTransform="capitalize">
                        {budget.period} • ${(budget.remainingAmount || 0).toFixed(2)} remaining
                      </Text>
                    </VStack>
                  </Card>
                </GridItem>
              ))}
            </Grid>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default Dashboard;