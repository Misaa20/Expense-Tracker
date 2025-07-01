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
  useColorModeValue,
  Button,
  ButtonGroup,
} from '@chakra-ui/react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Card from '../components/ui/Card';
import ExpenseChart from '../components/charts/ExpenseChart';
import { expenseService } from '../services/expenses';
import { budgetService } from '../services/budgets';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const toast = useToast();

  // Theme-aware colors - moved to top level
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const categoryCardBg = useColorModeValue('gray.100', 'gray.700');
  const categoryCardBorder = useColorModeValue('gray.200', 'gray.600');

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        console.log('Fetching dashboard data...');
        
        const [expensesResponse, statsResponse, budgetsResponse] = await Promise.all([
          expenseService.getExpenses({ limit: 100 }),
          expenseService.getExpenseStats(selectedPeriod),
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
  }, [toast, selectedPeriod]);

  // Function to refresh chart data with different periods
  const refreshChartData = async (period) => {
    setChartLoading(true);
    setSelectedPeriod(period);
    try {
      console.log(`Fetching stats for period: ${period}`);
      const statsResponse = await expenseService.getExpenseStats(period);
      console.log('Stats response:', statsResponse);
      setStatsData(statsResponse.stats);
      
      toast({
        title: 'Chart Updated',
        description: `Showing expenses for ${period}`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error refreshing chart data:', error);
      toast({
        title: 'Error refreshing chart',
        description: 'Could not update chart data.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setChartLoading(false);
    }
  };

  // Process expense data for charts with enhanced colors and formatting
  const getExpenseChartData = () => {
    console.log('Processing chart data:', statsData);
    
    if (!statsData?.categoryBreakdown || statsData.categoryBreakdown.length === 0) {
      console.log('No category breakdown data available');
      return {
        labels: ['No Expenses'],
        datasets: [{
          label: 'Expenses ($)',
          data: [0],
          backgroundColor: ['rgba(200, 200, 200, 0.6)'],
          borderColor: ['rgba(200, 200, 200, 1)'],
          borderWidth: 1,
        }]
      };
    }

    // Enhanced color palette
    const colorPalette = [
      { bg: 'rgba(255, 99, 132, 0.8)', border: 'rgba(255, 99, 132, 1)' },
      { bg: 'rgba(54, 162, 235, 0.8)', border: 'rgba(54, 162, 235, 1)' },
      { bg: 'rgba(255, 205, 86, 0.8)', border: 'rgba(255, 205, 86, 1)' },
      { bg: 'rgba(75, 192, 192, 0.8)', border: 'rgba(75, 192, 192, 1)' },
      { bg: 'rgba(153, 102, 255, 0.8)', border: 'rgba(153, 102, 255, 1)' },
      { bg: 'rgba(255, 159, 64, 0.8)', border: 'rgba(255, 159, 64, 1)' },
      { bg: 'rgba(199, 199, 199, 0.8)', border: 'rgba(199, 199, 199, 1)' },
      { bg: 'rgba(83, 102, 255, 0.8)', border: 'rgba(83, 102, 255, 1)' },
    ];

    const backgroundColors = [];
    const borderColors = [];
    
    statsData.categoryBreakdown.forEach((cat, index) => {
      if (cat.color) {
        backgroundColors.push(cat.color + 'CC'); // Add transparency
        borderColors.push(cat.color);
      } else {
        const colorIndex = index % colorPalette.length;
        backgroundColors.push(colorPalette[colorIndex].bg);
        borderColors.push(colorPalette[colorIndex].border);
      }
    });

    const chartData = {
      labels: statsData.categoryBreakdown.map(cat => cat.name || 'Unknown'),
      datasets: [{
        label: 'Expenses ($)',
        data: statsData.categoryBreakdown.map(cat => parseFloat(cat.total).toFixed(2)),
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2,
      }]
    };

    console.log('Generated chart data:', chartData);
    return chartData;
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
      <Box bg={bgColor} minH="100vh">
        <Header />
        <Flex>
          <Sidebar />
          <Box flex={1} p={6} bg={bgColor}>
            <Center h="400px">
              <VStack>
                <Spinner size="xl" color="blue.500" />
                <Text color={textColor}>Loading dashboard...</Text>
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
    <Box bg={bgColor} minH="100vh">
      <Header />
      <Flex>
        <Sidebar />
        <Box flex={1} p={6} bg={bgColor}>
          <HStack justify="space-between" mb={6}>
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>
              Dashboard
            </Text>
            <VStack align="end" spacing={2}>
              <Badge colorScheme="green" p={2} borderRadius="md">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Badge>
              {/* Period Selection */}
              <ButtonGroup size="sm" isAttached variant="outline">
                <Button
                  colorScheme={selectedPeriod === 'week' ? 'blue' : 'gray'}
                  onClick={() => refreshChartData('week')}
                  isLoading={chartLoading && selectedPeriod === 'week'}
                >
                  Week
                </Button>
                <Button
                  colorScheme={selectedPeriod === 'month' ? 'blue' : 'gray'}
                  onClick={() => refreshChartData('month')}
                  isLoading={chartLoading && selectedPeriod === 'month'}
                >
                  Month
                </Button>
                <Button
                  colorScheme={selectedPeriod === 'year' ? 'blue' : 'gray'}
                  onClick={() => refreshChartData('year')}
                  isLoading={chartLoading && selectedPeriod === 'year'}
                >
                  Year
                </Button>
              </ButtonGroup>
            </VStack>
          </HStack>

          {expenses.length === 0 && (
            <Alert status="info" mb={6}>
              <AlertIcon />
              Welcome! Add your first expense to see meaningful dashboard insights.
            </Alert>
          )}
          
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6} mb={8}>
            {stats.map((stat, index) => (
              <GridItem key={index}>
                <Card>
                  <Stat>
                    <StatLabel color={mutedTextColor} fontSize="sm">
                      {stat.label}
                    </StatLabel>
                    <StatNumber fontSize="2xl" fontWeight="bold" color={`${stat.color}.500`}>
                      {stat.value}
                    </StatNumber>
                    <StatHelpText display="flex" alignItems="center" color={mutedTextColor}>
                      {stat.isPositive && <StatArrow type="increase" />}
                      {!stat.isPositive && <StatArrow type="decrease" />}
                      {stat.change}
                    </StatHelpText>
                  </Stat>
                </Card>
              </GridItem>
            ))}
          </Grid>

          <Grid templateColumns={{ base: "1fr", xl: "repeat(3, 1fr)" }} gap={6} mb={6}>
            {/* Bar Chart */}
            <GridItem colSpan={{ base: 1, xl: 1 }}>
              <ExpenseChart 
                data={expenseData} 
                type="bar" 
                loading={chartLoading}
                period={selectedPeriod}
                onPeriodChange={refreshChartData}
              />
            </GridItem>

            {/* Doughnut Chart */}
            <GridItem colSpan={{ base: 1, xl: 1 }}>
              <ExpenseChart 
                data={expenseData} 
                type="doughnut" 
                loading={chartLoading}
                period={selectedPeriod}
                onPeriodChange={refreshChartData}
              />
            </GridItem>

            {/* Recent Expenses */}
            <GridItem colSpan={{ base: 1, xl: 1 }}>
              <Card>
                <Text fontSize="lg" fontWeight="semibold" mb={4} color={textColor}>
                  Recent Expenses
                </Text>
                {recentExpenses.length === 0 ? (
                  <Text color={mutedTextColor} textAlign="center" py={8}>
                    No recent expenses
                  </Text>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {recentExpenses.map((expense, index) => (
                      <Box key={expense._id}>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium" fontSize="sm" color={textColor}>
                              {expense.title}
                            </Text>
                            <Text fontSize="xs" color={mutedTextColor}>
                              {expense.category?.name || 'No Category'}
                            </Text>
                          </VStack>
                          <VStack align="end" spacing={0}>
                            <Text fontWeight="bold" color="red.500">
                              -${expense.amount.toFixed(2)}
                            </Text>
                            <Text fontSize="xs" color={mutedTextColor}>
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

          {/* Category Breakdown Details */}
          {statsData?.categoryBreakdown && statsData.categoryBreakdown.length > 0 && (
            <Card mb={6}>
              <Text fontSize="lg" fontWeight="semibold" mb={4} color={textColor}>
                Category Breakdown ({selectedPeriod})
              </Text>
              <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                {statsData.categoryBreakdown.map((category, index) => (
                  <Box 
                    key={category._id || index} 
                    p={4} 
                    borderRadius="md" 
                    bg={categoryCardBg}
                    border="1px solid"
                    borderColor={categoryCardBorder}
                  >
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontWeight="medium" color={textColor}>
                        {category.name}
                      </Text>
                      <Badge colorScheme="blue">{category.count} items</Badge>
                    </Flex>
                    <Text fontSize="xl" fontWeight="bold" color="blue.500">
                      ${category.total.toFixed(2)}
                    </Text>
                    <Text fontSize="sm" color={mutedTextColor}>
                      {((category.total / (statsData.totalExpenses || 1)) * 100).toFixed(1)}% of total
                    </Text>
                  </Box>
                ))}
              </Grid>
            </Card>
          )}

          {/* Budget Overview */}
          {budgets.length > 0 && (
            <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }} gap={6}>
              {budgets.slice(0, 3).map((budget) => (
                <GridItem key={budget._id}>
                  <Card>
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between">
                        <Text fontWeight="semibold" fontSize="md" color={textColor}>
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
                          <Text fontSize="sm" color={mutedTextColor}>
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
                      
                      <Text fontSize="xs" color={mutedTextColor} textTransform="capitalize">
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