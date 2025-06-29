import api from './api';

export const categoryService = {
  getCategories: async () => {
    const response = await api.get('/api/categories');
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/api/categories', categoryData);
    return response.data;
  }
}; 