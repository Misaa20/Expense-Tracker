import api from './api';

export const expenseService = {
  getExpenses: async (params = {}) => {
    const response = await api.get('/api/expenses', { params });
    return response.data;
  },

  getExpense: async (id) => {
    const response = await api.get(`/api/expenses/${id}`);
    return response.data;
  },

  createExpense: async (expenseData) => {
    const response = await api.post('/api/expenses', expenseData);
    return response.data;
  },

  updateExpense: async (id, expenseData) => {
    console.log('Updating expense with ID:', id);
    const response = await api.put(`/api/expenses/${id}`, expenseData);
    return response.data;
  },

  deleteExpense: async (id) => {
    console.log('Deleting expense with ID:', id);
    console.log('Making DELETE request to:', `/expenses/${id}`);
    const response = await api.delete(`/api/expenses/${id}`);
    console.log('Delete response:', response);
    return response.data;
  },

  getExpenseStats: async (period = 'month') => {
    const response = await api.get(`/api/expenses/stats?period=${period}`);
    return response.data;
  }
};
