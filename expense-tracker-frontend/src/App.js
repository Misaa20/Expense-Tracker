import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Dashboard />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}
export default App;
