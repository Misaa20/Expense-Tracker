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
  Flex
} from '@chakra-ui/react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Card from '../components/ui/Card';
import ExpenseChart from '../components/charts/ExpenseChart';

const Dashboard = () => {
  const [expenseData, setExpenseData] = useState({
    labels: ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping'],
    datasets: [
      {
        label: 'Expenses',
        data: [300, 150, 200, 400, 250],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
      },
    ],
  });

  const stats = [
    { label: 'Total Expenses', value: '$1,300', change: '+12%' },
    { label: 'Monthly Budget', value: '$2,000', change: '-5%' },
    { label: 'Remaining Budget', value: '$700', change: '+8%' },
    { label: 'Categories', value: '8', change: '+2' },
  ];

  return (
    <Box>
      <Header />
      <Flex>
        <Sidebar />
        <Box flex={1} p={6} bg="gray.50">
          <Text fontSize="2xl" fontWeight="bold" mb={6}>
            Dashboard
          </Text>
          
          <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={6}>
            {stats.map((stat, index) => (
              <GridItem key={index}>
                <Card>
                  <Stat>
                    <StatLabel color="gray.600">{stat.label}</StatLabel>
                    <StatNumber>{stat.value}</StatNumber>
                    <StatHelpText color={stat.change.includes('+') ? 'green.500' : 'red.500'}>
                      {stat.change} from last month
                    </StatHelpText>
                  </Stat>
                </Card>
              </GridItem>
            ))}
          </Grid>

          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            <GridItem>
              <ExpenseChart data={expenseData} type="bar" />
            </GridItem>
            <GridItem>
              <ExpenseChart data={expenseData} type="doughnut" />
            </GridItem>
          </Grid>
        </Box>
      </Flex>
    </Box>
  );
};

export default Dashboard;
