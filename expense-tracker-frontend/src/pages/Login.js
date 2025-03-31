import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { TextField, Button, Container, Typography, Box } from '@mui/material';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { success } = await login(formData);
    if (success) {
      navigate('/');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Box mt={2}>
            <Button type="submit" variant="contained" color="primary">
              Login
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default Login;