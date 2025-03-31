import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../utils/api';
import { AuthContext } from './AuthContext';

const ExpenseContext = createContext();

const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useContext(AuthContext);

  const getExpenses = async () => {
    try {
      setLoading(true);
      const res = await API.get('/expenses');
      setExpenses(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error fetching expenses');
      setLoading(false);
    }
  };

  const addExpense = async (expense) => {
    try {
      const res = await API.post('/expenses', expense);
      setExpenses([res.data, ...expenses]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data };
    }
  };

  const updateExpense = async (id, updatedExpense) => {
    try {
      const res = await API.put(`/expenses/${id}`, updatedExpense);
      setExpenses(
        expenses.map((expense) =>
          expense._id === id ? res.data : expense
        )
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data };
    }
  };

  const deleteExpense = async (id) => {
    try {
      await API.delete(`/expenses/${id}`);
      setExpenses(expenses.filter((expense) => expense._id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data };
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      getExpenses();
    }
  }, [isAuthenticated]);

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        loading,
        error,
        addExpense,
        updateExpense,
        deleteExpense,
        getExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export { ExpenseContext, ExpenseProvider };