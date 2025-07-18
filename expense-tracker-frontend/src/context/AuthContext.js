import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
    case 'CHECK_AUTH_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
    case 'CHECK_AUTH_SUCCESS':
      return { ...state, loading: false, user: action.payload, isAuthenticated: true };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
    case 'CHECK_AUTH_FAILURE':
      return { ...state, loading: false, error: action.payload, isAuthenticated: false };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, token: null };
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true, // Start with loading true to check existing auth
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          dispatch({ type: 'CHECK_AUTH_START' });
          const response = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          dispatch({ type: 'CHECK_AUTH_SUCCESS', payload: response.data.user });
          dispatch({ type: 'SET_TOKEN', payload: token });
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem('token');
          dispatch({ type: 'CHECK_AUTH_FAILURE', payload: 'Invalid token' });
        }
      } else {
        // No token found
        dispatch({ type: 'CHECK_AUTH_FAILURE', payload: 'No token found' });
      }
    };

    checkAuth();
  }, []);

  // Set axios defaults
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      dispatch({ type: 'SET_TOKEN', payload: token });
      
      return { success: true };
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.response?.data?.message || 'Login failed' });
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'REGISTER_START' });
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      dispatch({ type: 'REGISTER_SUCCESS', payload: user });
      dispatch({ type: 'SET_TOKEN', payload: token });
      
      return { success: true };
    } catch (error) {
      dispatch({ type: 'REGISTER_FAILURE', payload: error.response?.data?.message || 'Registration failed' });
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      updateUser,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};