import api from './api';

export const userService = {
  getProfile: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/api/auth/profile', profileData);
    return response.data;
  }
}; 