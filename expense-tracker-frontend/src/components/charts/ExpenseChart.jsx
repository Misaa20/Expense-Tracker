import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Box, Text, Flex, Stat, StatLabel, StatNumber } from '@chakra-ui/react';
import Card from '../ui/Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ExpenseChart = ({ data, type = 'bar' }) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Expense Overview',
      },
    },
    scales: type === 'bar' ? {
      y: {
        beginAtZero: true,
      },
    } : undefined,
  };

  const ChartComponent = type === 'bar' ? Bar : Doughnut;

  return (
    <Card>
      <Text fontSize="lg" fontWeight="semibold" mb={4}>
        Expense Analytics
      </Text>
      <Box h="300px">
        <ChartComponent options={chartOptions} data={data} />
      </Box>
    </Card>
  );
};

export default ExpenseChart;
