import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { expenseService } from '../services/expenses';
import { useAuth } from './AuthContext';

const ExpenseContext = createContext();

const expenseReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_EXPENSES_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_EXPENSES_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        expenses: action.payload.expenses,
        pagination: action.payload.pagination
      };
    case 'FETCH_EXPENSES_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_EXPENSE':
      return { 
        ...state, 
        expenses: [action.payload, ...state.expenses]
      };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense._id === action.payload._id ? action.payload : expense
        )
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense._id !== action.payload)
      };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    default:
      return state;
  }
};

const initialState = {
  expenses: [],
  stats: null,
  pagination: null,
  loading: false,
  error: null
};

export const ExpenseProvider = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Fetch expenses when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchExpenses();
      fetchStats();
    }
  }, [isAuthenticated]);

  const fetchExpenses = async (params = {}) => {
    dispatch({ type: 'FETCH_EXPENSES_START' });
    try {
      const data = await expenseService.getExpenses(params);
      dispatch({ type: 'FETCH_EXPENSES_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_EXPENSES_ERROR', payload: error.message });
    }
  };

  const addExpense = async (expenseData) => {
    try {
      const data = await expenseService.createExpense(expenseData);
      dispatch({ type: 'ADD_EXPENSE', payload: data.expense });
      fetchStats(); // Refresh stats
      return data;
    } catch (error) {
      throw error;
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      const data = await expenseService.updateExpense(id, expenseData);
      dispatch({ type: 'UPDATE_EXPENSE', payload: data.expense });
      fetchStats(); // Refresh stats
      return data;
    } catch (error) {
      throw error;
    }
  };

  const deleteExpense = async (id) => {
    try {
      await expenseService.deleteExpense(id);
      dispatch({ type: 'DELETE_EXPENSE', payload: id });
      fetchStats(); // Refresh stats
    } catch (error) {
      throw error;
    }
  };

  const fetchStats = async (period = 'month') => {
    try {
      const data = await expenseService.getExpenseStats(period);
      dispatch({ type: 'SET_STATS', payload: data.stats });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <ExpenseContext.Provider value={{
      ...state,
      fetchExpenses,
      addExpense,
      updateExpense,
      deleteExpense,
      fetchStats
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
