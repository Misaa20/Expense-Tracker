import api from './api';

export const budgetService = {
  getBudgets: async (params = {}) => {
    const response = await api.get('/api/budgets', { params });
    return response.data;
  },

  createBudget: async (budgetData) => {
    const response = await api.post('/api/budgets', budgetData);
    return response.data;
  },

  updateBudget: async (id, budgetData) => {
    const response = await api.put(`/api/budgets/${id}`, budgetData);
    return response.data;
  },

  deleteBudget: async (id) => {
    const response = await api.delete(`/api/budgets/${id}`);
    return response.data;
  }
}; 