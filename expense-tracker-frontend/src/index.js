import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css';
import { AuthProvider } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
const root = ReactDOM.createRoot(document.getElementById('root'));




root.render(
  <React.StrictMode>
    <AuthProvider>
      <ExpenseProvider>
        <App />
      </ExpenseProvider>
    </AuthProvider>
  </React.StrictMode>
);