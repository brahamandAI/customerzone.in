import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Grid, Avatar, Fade, Zoom, Chip } from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import AddIcon from '@mui/icons-material/Add';

const CreateCategory = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budgetLimit: '',
    color: '#1976d2'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Category data:', formData);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #008080 0%, #20B2AA 100%)',
      p: 4,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Cpath d="M40 40c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        animation: 'pulse 15s ease-in-out infinite',
        '@keyframes pulse': {
          '0%, 100%': { opacity: 0.5 },
          '50%': { opacity: 0.8 }
        }
      }} />
      
      <Fade in timeout={1000}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight={900} color="white" textAlign="center" gutterBottom sx={{ mb: 4, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            Create Expense Category
          </Typography>
          
          <Grid container justifyContent="center">
            <Grid item xs={12} md={8} lg={6}>
              <Zoom in style={{ transitionDelay: '300ms' }}>
                <Paper elevation={24} sx={{ 
                  p: 4, 
                  borderRadius: 4, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: '#f093fb', mr: 2, width: 56, height: 56 }}>
                      <CategoryIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="h5" fontWeight={700} color="#f093fb">
                      Category Details
                    </Typography>
                  </Box>
                  
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Category Name"
                          variant="outlined"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': { borderColor: '#f093fb' },
                              '&.Mui-focused fieldset': { borderColor: '#f093fb' }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          variant="outlined"
                          multiline
                          rows={3}
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': { borderColor: '#f093fb' },
                              '&.Mui-focused fieldset': { borderColor: '#f093fb' }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Budget Limit (₹)"
                          variant="outlined"
                          type="number"
                          value={formData.budgetLimit}
                          onChange={(e) => setFormData({...formData, budgetLimit: e.target.value})}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': { borderColor: '#f093fb' },
                              '&.Mui-focused fieldset': { borderColor: '#f093fb' }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" color="text.secondary">Color:</Typography>
                          <Chip 
                            label="Default" 
                            sx={{ 
                              bgcolor: formData.color, 
                              color: 'white',
                              fontWeight: 600,
                              '&:hover': { opacity: 0.8 }
                            }} 
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          fullWidth
                          startIcon={<AddIcon />}
                          sx={{
                            background: 'linear-gradient(45deg, #f093fb 30%, #f5576c 90%)',
                            borderRadius: 3,
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            boxShadow: '0 8px 32px rgba(240, 147, 251, 0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 12px 40px rgba(240, 147, 251, 0.4)'
                            }
                          }}
                        >
                          Create Category
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </Paper>
              </Zoom>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Box>
  );
};

export default CreateCategory; 