import api from './api';

export const budgetService = {
  getBudgets: async (params = {}) => {
    const response = await api.get('/api/budgets', { params });
    return response.data;
  },

  getBudget: async (id) => {
    console.log('Getting budget with ID:', id);
    const response = await api.get(`/api/budgets/${id}`);
    return response.data;
  },

  createBudget: async (budgetData) => {
    const response = await api.post('/api/budgets', budgetData);
    return response.data;
  },

  updateBudget: async (id, budgetData) => {
    console.log('Updating budget with ID:', id);
    console.log('Making PUT request to:', `/budgets/${id}`);
    const response = await api.put(`/api/budgets/${id}`, budgetData);
    console.log('Update response:', response);
    return response.data;
  },

  deleteBudget: async (id) => {
    console.log('Deleting budget with ID:', id);
    console.log('Making DELETE request to:', `/budgets/${id}`);
    const response = await api.delete(`/api/budgets/${id}`);
    console.log('Delete response:', response);
    return response.data;
  }
}; 