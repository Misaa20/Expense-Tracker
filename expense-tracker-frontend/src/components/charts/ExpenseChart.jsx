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
import { 
  Box, 
  Text, 
  Flex, 
  Spinner, 
  Center, 
  VStack, 
  useColorModeValue,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
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

const ExpenseChart = ({ 
  data, 
  type = 'bar', 
  loading = false, 
  period = 'month',
  onPeriodChange 
}) => {
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const gridColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Check if we have meaningful data
  const hasData = data && data.labels && data.labels.length > 0 && 
                  !data.labels.includes('No Expenses') && 
                  data.datasets[0].data.some(value => parseFloat(value) > 0);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: type === 'doughnut' ? 'bottom' : 'top',
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 11
          },
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const total = data.datasets[0].data.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
                const percentage = total > 0 ? ((parseFloat(value) / total) * 100).toFixed(1) : '0.0';
                return {
                  text: `${label}: $${parseFloat(value).toFixed(2)} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor[i],
                  lineWidth: 2,
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      title: {
        display: true,
        text: `${type === 'doughnut' ? 'Category Distribution' : 'Category Expenses'} - ${period.charAt(0).toUpperCase() + period.slice(1)}`,
        font: {
          size: 14,
          weight: 'bold'
        },
        color: textColor
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = parseFloat(context.parsed || context.raw);
            const dataset = context.dataset;
            const total = dataset.data.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1
      }
    },
    scales: type === 'bar' ? {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(2);
          },
          color: mutedTextColor
        },
        grid: {
          color: gridColor
        }
      },
      x: {
        ticks: {
          color: mutedTextColor,
          maxRotation: 45
        },
        grid: {
          display: false
        }
      }
    } : undefined,
  };

  const ChartComponent = type === 'bar' ? Bar : Doughnut;

  // Calculate total for display
  const totalAmount = hasData ? 
    data.datasets[0].data.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) : 0;

  return (
    <Card>
      <Text fontSize="lg" fontWeight="semibold" mb={4} color={textColor}>
        {type === 'doughnut' ? 'Expense Distribution' : 'Expense Analytics'}
      </Text>
      
      <Box h="300px" position="relative">
        {loading ? (
          <Center h="100%">
            <VStack spacing={3}>
              <Spinner size="lg" color="blue.500" thickness="4px" />
              <Text color={textColor} fontSize="sm">Loading chart data...</Text>
            </VStack>
          </Center>
        ) : !hasData ? (
          <Center h="100%">
            <VStack spacing={4}>
              <Alert status="info" variant="subtle">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">No expense data available</Text>
                  <Text fontSize="sm">
                    Add some expenses to see your spending analytics for this {period}
                  </Text>
                </VStack>
              </Alert>
            </VStack>
          </Center>
        ) : (
          <ChartComponent options={chartOptions} data={data} />
        )}
      </Box>
      
      {hasData && (
        <Box mt={4} pt={4} borderTop="1px solid" borderColor={borderColor}>
          <Flex justify="space-between" align="center">
            <Text fontSize="sm" color={mutedTextColor}>
              Period: {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
            <Text fontSize="md" fontWeight="bold" color="blue.500">
              Total: ${totalAmount.toFixed(2)}
            </Text>
          </Flex>
        </Box>
      )}
    </Card>
  );
};

export default ExpenseChart;
