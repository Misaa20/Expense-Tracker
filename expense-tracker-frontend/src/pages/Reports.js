import React, { useState } from 'react';
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

  // Sample data - in a real app, this would come from your backend
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Expenses',
        data: [1200, 1900, 1500, 2100, 1800, 2300],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const categoryData = {
    labels: ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping'],
    datasets: [
      {
        data: [30, 20, 15, 25, 10],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      },
    ],
  };

  const trendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Spending Trend',
        data: [450, 380, 520, 480],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const stats = [
    {
      label: 'Total Expenses',
      value: '$2,300',
      change: '+12%',
      isPositive: true,
    },
    {
      label: 'Average Daily Spend',
      value: '$76.67',
      change: '-5%',
      isPositive: false,
    },
    {
      label: 'Highest Category',
      value: 'Food',
      change: '30%',
      isPositive: true,
    },
    {
      label: 'Savings Rate',
      value: '25%',
      change: '+3%',
      isPositive: true,
    },
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

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

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardBody>
                  <Stat>
                    <StatLabel color="gray.600">{stat.label}</StatLabel>
                    <StatNumber>{stat.value}</StatNumber>
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
                    Monthly Expenses
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
                    <Doughnut options={chartOptions} data={categoryData} />
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            <Card gridColumn={{ lg: 'span 2' }}>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Text fontSize="lg" fontWeight="semibold">
                    Weekly Spending Trend
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