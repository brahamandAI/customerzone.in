import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(120deg, #e3f2fd 60%, #fff 100%)' }}>
      <Typography variant="h1" color="#1976d2" fontWeight={900} gutterBottom>404</Typography>
      <Typography variant="h5" color="text.secondary" gutterBottom>Page Not Found</Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/dashboard')} sx={{ mt: 3 }}>
        Go to Dashboard
      </Button>
    </Box>
  );
};

export default NotFound; 