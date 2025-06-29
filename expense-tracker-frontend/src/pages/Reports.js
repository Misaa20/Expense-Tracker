import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Select,
  HStack,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  VStack,
  Spinner,
  Center,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { expenseService } from '../services/expenses';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Reports = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [expensesData, setExpensesData] = useState([]);
  const [previousPeriodData, setPreviousPeriodData] = useState(null);
  const toast = useToast();

  // Fetch current period stats
  useEffect(() => {
    const fetchStatsData = async () => {
      setLoading(true);
      try {
        console.log('Fetching stats for period:', timeRange);
        const [currentStats, allExpenses] = await Promise.all([
          expenseService.getExpenseStats(timeRange),
          expenseService.getExpenses()
        ]);
        
        console.log('Current stats:', currentStats);
        console.log('All expenses:', allExpenses);
        
        setStatsData(currentStats.stats);
        setExpensesData(allExpenses.expenses || []);
        
        // Fetch previous period data for comparison
        await fetchPreviousPeriodData(timeRange);
      } catch (error) {
        console.error('Error fetching reports data:', error);
        toast({
          title: 'Error fetching reports data',
          description: error.response?.data?.message || 'Could not retrieve reports data.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatsData();
  }, [timeRange, toast]);

  // Fetch previous period data for comparison
  const fetchPreviousPeriodData = async (period) => {
    try {
      // Calculate previous period based on current period
      const now = new Date();
      let startDate, endDate;
      
      switch (period) {
        case 'week':
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);
          break;
        case 'year':
          endDate = new Date(now.getFullYear() - 1, 11, 31);
          startDate = new Date(now.getFullYear() - 2, 0, 1);
          break;
        default: // month
          endDate = new Date(now.getFullYear(), now.getMonth() - 1, 0);
          startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      }

      const previousExpenses = await expenseService.getExpenses({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      const previousTotal = previousExpenses.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
      setPreviousPeriodData({ totalExpenses: previousTotal });
    } catch (error) {
      console.error('Error fetching previous period data:', error);
      setPreviousPeriodData({ totalExpenses: 0 });
    }
  };

  // Process data for monthly chart
  const getMonthlyData = () => {
    if (!expensesData || expensesData.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'Expenses',
          data: [],
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        }]
      };
    }

    const monthlyTotals = {};
    const currentYear = new Date().getFullYear();
    
    // Initialize all months to 0
    for (let i = 0; i < 12; i++) {
      const month = new Date(currentYear, i).toLocaleDateString('en-US', { month: 'short' });
      monthlyTotals[month] = 0;
    }

    // Aggregate expenses by month
    expensesData.forEach(expense => {
      const date = new Date(expense.date);
      if (date.getFullYear() === currentYear) {
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        monthlyTotals[month] += expense.amount;
      }
    });

    return {
      labels: Object.keys(monthlyTotals),
      datasets: [{
        label: 'Expenses',
        data: Object.values(monthlyTotals),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgba(53, 162, 235, 1)',
        borderWidth: 1,
      }]
    };
  };

  // Process data for category chart
  const getCategoryData = () => {
    if (!statsData?.categoryBreakdown || statsData.categoryBreakdown.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [1],
          backgroundColor: ['rgba(200, 200, 200, 0.5)'],
        }]
      };
    }

    const colors = [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)',
      'rgba(255, 159, 64, 0.8)',
      'rgba(201, 203, 207, 0.8)',
      'rgba(255, 99, 255, 0.8)',
    ];

    return {
      labels: statsData.categoryBreakdown.map(cat => cat.name),
      datasets: [{
        data: statsData.categoryBreakdown.map(cat => cat.total),
        backgroundColor: colors.slice(0, statsData.categoryBreakdown.length),
        borderWidth: 2,
      }]
    };
  };

  // Process data for trend chart
  const getTrendData = () => {
    if (!statsData?.dailyTrend || statsData.dailyTrend.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'Daily Spending',
          data: [0],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        }]
      };
    }

    return {
      labels: statsData.dailyTrend.map(day => 
        `${day._id.month}/${day._id.day}`
      ),
      datasets: [{
        label: 'Daily Spending',
        data: statsData.dailyTrend.map(day => day.total),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        fill: true,
      }]
    };
  };

  // Calculate dynamic statistics
  const getCalculatedStats = () => {
    if (!statsData || !expensesData) {
      return [
        { label: 'Total Expenses', value: '$0.00', change: '0%', isPositive: true },
        { label: 'Average Daily Spend', value: '$0.00', change: '0%', isPositive: true },
        { label: 'Highest Category', value: 'N/A', change: '0%', isPositive: true },
        { label: 'Total Transactions', value: '0', change: '0%', isPositive: true },
      ];
    }

    const currentTotal = statsData.totalExpenses || 0;
    const previousTotal = previousPeriodData?.totalExpenses || 0;
    const changePercent = previousTotal > 0 
      ? (((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1)
      : 0;

    // Calculate average daily spend
    const daysInPeriod = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    const avgDaily = currentTotal / daysInPeriod;

    // Get highest category
    const highestCategory = statsData.categoryBreakdown?.length > 0 
      ? statsData.categoryBreakdown[0]
      : { name: 'N/A', total: 0 };

    const categoryPercent = currentTotal > 0 
      ? ((highestCategory.total / currentTotal) * 100).toFixed(1)
      : 0;

    return [
      {
        label: 'Total Expenses',
        value: `$${currentTotal.toFixed(2)}`,
        change: `${changePercent > 0 ? '+' : ''}${changePercent}%`,
        isPositive: changePercent <= 0,
      },
      {
        label: 'Average Daily Spend',
        value: `$${avgDaily.toFixed(2)}`,
        change: `${daysInPeriod} days`,
        isPositive: true,
      },
      {
        label: 'Highest Category',
        value: highestCategory.name,
        change: `${categoryPercent}%`,
        isPositive: true,
      },
      {
        label: 'Total Transactions',
        value: (statsData.totalTransactions || 0).toString(),
        change: `${timeRange}ly`,
        isPositive: true,
      },
    ];
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `$${context.parsed.y?.toFixed(2) || context.parsed || 0}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(0);
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: $${context.parsed.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <Box>
        <Header />
        <Box display="flex">
          <Sidebar />
          <Box flex="1" p={6}>
            <Center h="400px">
              <VStack>
                <Spinner size="xl" />
                <Text>Loading reports data...</Text>
              </VStack>
            </Center>
          </Box>
        </Box>
      </Box>
    );
  }

  const stats = getCalculatedStats();
  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();
  const trendData = getTrendData();

  return (
    <Box>
      <Header />
      <Box display="flex">
        <Sidebar />
        <Box flex="1" p={6}>
          <HStack justify="space-between" mb={6}>
            <Heading size="lg">Reports & Analytics</Heading>
            <Select
              width="200px"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </Select>
          </HStack>

          {(!expensesData || expensesData.length === 0) && (
            <Alert status="info" mb={6}>
              <AlertIcon />
              No expense data available for the selected period. Add some expenses to see meaningful reports!
            </Alert>
          )}

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardBody>
                  <Stat>
                    <StatLabel color="gray.600">{stat.label}</StatLabel>
                    <StatNumber fontSize={{ base: 'lg', md: 'xl' }}>{stat.value}</StatNumber>
                    <StatHelpText>
                      <StatArrow type={stat.isPositive ? 'increase' : 'decrease'} />
                      {stat.change} from last period
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            <Card>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Text fontSize="lg" fontWeight="semibold">
                    Monthly Expenses ({new Date().getFullYear()})
                  </Text>
                  <Box height="300px">
                    <Bar options={chartOptions} data={monthlyData} />
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Text fontSize="lg" fontWeight="semibold">
                    Spending by Category
                  </Text>
                  <Box height="300px">
                    <Doughnut options={doughnutOptions} data={categoryData} />
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            <Card gridColumn={{ lg: 'span 2' }}>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Text fontSize="lg" fontWeight="semibold">
                    Daily Spending Trend ({timeRange === 'week' ? 'Last 7 Days' : timeRange === 'month' ? 'This Month' : 'This Year'})
                  </Text>
                  <Box height="300px">
                    <Line options={chartOptions} data={trendData} />
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Box>
      </Box>
    </Box>
  );
};

export default Reports; 