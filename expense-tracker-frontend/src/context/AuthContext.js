import React, { createContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // You might want to add an endpoint to validate token and get user data
        // For now, we'll just check if token exists
        setIsAuthenticated(true);
        setLoading(false);
      } catch (err) {
        console.error(err);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = async (formData) => {
    try {
      const res = await API.post('/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      console.error(err.response.data);
      return { success: false, error: err.response.data };
    }
  };

  const login = async (formData) => {
    try {
      const res = await API.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      console.error(err.response.data);
      return { success: false, error: err.response.data };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };