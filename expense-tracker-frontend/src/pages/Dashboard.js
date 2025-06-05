import React, { useContext, useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { ExpenseContext } from '../context/ExpenseContext';
import { AuthContext } from '../context/AuthContext';
import ExpenseChart from '../components/ExpenseChart';

const Dashboard = () => {
  const { 
    expenses, 
    addExpense, 
    updateExpense, 
    deleteExpense,
    loading,
    error 
  } = useContext(ExpenseContext);
  const { logout, user } = useContext(AuthContext);

  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'Food',
    date: new Date().toISOString().split('T')[0] // Format as YYYY-MM-DD
  });
  
  const [editExpense, setEditExpense] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const expensesPerPage = 5;
  
  // Filter expenses by type
  const incomeExpenses = expenses.filter(e => e.type === 'income');
  const expenseExpenses = expenses.filter(e => e.type === 'expense');
  
  // Calculate totals
  const totalIncome = incomeExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = expenseExpenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpenses;
  
  // Get current expenses for pagination
  const indexOfLastExpense = currentPage * expensesPerPage;
  const indexOfFirstExpense = indexOfLastExpense - expensesPerPage;
  const currentExpenses = expenses.slice(indexOfFirstExpense, indexOfLastExpense);
  const totalPages = Math.ceil(expenses.length / expensesPerPage);
  
  // Common categories
  const categories = [
    'Food', 
    'Transportation', 
    'Housing', 
    'Entertainment', 
    'Utilities', 
    'Healthcare', 
    'Shopping', 
    'Other'
  ];

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleChange = (e) => {
    setNewExpense({ ...newExpense, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { success } = await addExpense({
      ...newExpense,
      amount: parseFloat(newExpense.amount),
      date: new Date(newExpense.date)
    });
    
    if (success) {
      setNewExpense({
        title: '',
        amount: '',
        type: 'expense',
        category: 'Food',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const handleEditClick = (expense) => {
    setEditExpense({
      ...expense,
      date: expense.date.split('T')[0] // Format as YYYY-MM-DD
    });
    setOpenEditDialog(true);
  };

  const handleEditChange = (e) => {
    setEditExpense({ ...editExpense, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async () => {
    const { success } = await updateExpense(editExpense._id, {
      ...editExpense,
      amount: parseFloat(editExpense.amount),
      date: new Date(editExpense.date)
    });
    
    if (success) {
      setOpenEditDialog(false);
      setEditExpense(null);
    }
  };

  const handleDelete = async (id) => {
    await deleteExpense(id);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading && expenses.length === 0) {
    return (
      <Box p={3}>
        <Typography variant="h6">Loading expenses...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name || 'User'}!
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" color="text.secondary">Total Income</Typography>
            <Typography variant="h3" color="success.main">
              ${totalIncome.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" color="text.secondary">Total Expenses</Typography>
            <Typography variant="h3" color="error.main">
              ${totalExpenses.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" color="text.secondary">Balance</Typography>
            <Typography variant="h3" color={balance >= 0 ? 'success.main' : 'error.main'}>
              ${balance.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Add New Transaction */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add New Transaction
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={newExpense.title}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                inputProps={{ step: "0.01" }}
                value={newExpense.amount}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={newExpense.type}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={newExpense.category}
                  onChange={handleChange}
                  required
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newExpense.date}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                fullWidth
                size="large"
              >
                Add Transaction
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {/* Charts */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Expense Breakdown
            </Typography>
            <Box height="300px">
              <ExpenseChart expenses={expenseExpenses} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Income Breakdown
            </Typography>
            <Box height="300px">
              <ExpenseChart expenses={incomeExpenses} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Transaction History */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Transactions
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentExpenses.length > 0 ? (
                currentExpenses.map((expense) => (
                  <TableRow 
                    key={expense._id}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      backgroundColor: expense.type === 'income' ? 'rgba(76, 175, 80, 0.08)' : 'rgba(244, 67, 54, 0.08)'
                    }}
                  >
                    <TableCell>{formatDate(expense.date)}</TableCell>
                    <TableCell>{expense.title}</TableCell>
                    <TableCell sx={{ color: expense.type === 'income' ? 'success.main' : 'error.main' }}>
                      {expense.type === 'income' ? '+' : '-'}${expense.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Box 
                        component="span" 
                        sx={{ 
                          textTransform: 'capitalize',
                          color: expense.type === 'income' ? 'success.main' : 'error.main'
                        }}
                      >
                        {expense.type}
                      </Box>
                    </TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEditClick(expense)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(expense._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        {expenses.length > expensesPerPage && (
          <Box display="flex" justifyContent="center" mt={2}>
            <IconButton 
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box display="flex" alignItems="center" mx={2}>
              Page {currentPage} of {totalPages}
            </Box>
            <IconButton 
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <ArrowForwardIcon />
            </IconButton>
          </Box>
        )}
      </Paper>
      
      {/* Logout Button */}
      <Box display="flex" justifyContent="flex-end">
        <Button 
          variant="outlined" 
          onClick={logout}
          sx={{ mt: 2 }}
        >
          Logout
        </Button>
      </Box>
      
      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Transaction</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={editExpense?.title || ''}
                onChange={handleEditChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                inputProps={{ step: "0.01" }}
                value={editExpense?.amount || ''}
                onChange={handleEditChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={editExpense?.type || 'expense'}
                  onChange={handleEditChange}
                  required
                >
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={editExpense?.category || 'Food'}
                  onChange={handleEditChange}
                  required
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={editExpense?.date || ''}
                onChange={handleEditChange}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleEditSubmit}
            variant="contained"
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;