import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Grid, Avatar, Fade, Zoom, FormControl, InputLabel, Select, MenuItem, Divider, Chip, IconButton } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WarningIcon from '@mui/icons-material/Warning';
import DeleteIcon from '@mui/icons-material/Delete';

const CreateSite = () => {
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    address: '',
    contactPerson: '',
    phone: '',
    email: '',
    monthlyBudget: '',
    budgetAlertThreshold: 80, // Default 80%
    vehicleKmLimit: 1000 // Default 1000 KM
  });

  const [categoryBudgets, setCategoryBudgets] = useState([
    { category: 'Petty', budget: '', used: 0 },
    { category: 'Material', budget: '', used: 0 },
    { category: 'Misc. Expense', budget: '', used: 0 },
    { category: 'Fuel', budget: '', used: 0 },
    { category: 'Equipment', budget: '', used: 0 },
    { category: 'Maintenance', budget: '', used: 0 },
    { category: 'Travel', budget: '', used: 0 },
    { category: 'Office Supplies', budget: '', used: 0 }
  ]);

  const handleCategoryBudgetChange = (index, field, value) => {
    const updatedBudgets = [...categoryBudgets];
    updatedBudgets[index] = { ...updatedBudgets[index], [field]: value };
    setCategoryBudgets(updatedBudgets);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const siteData = {
      ...formData,
      categoryBudgets,
      totalBudget: categoryBudgets.reduce((sum, cat) => sum + (parseFloat(cat.budget) || 0), 0)
    };
    console.log('Site data with budgets:', siteData);
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
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        animation: 'float 20s ease-in-out infinite',
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        }
      }} />
      
      <Fade in timeout={1000}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight={900} color="white" textAlign="center" gutterBottom sx={{ mb: 4, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            Create New Site
          </Typography>
          
          <Grid container justifyContent="center">
            <Grid item xs={12} md={8} lg={6}>
              <Zoom in style={{ transitionDelay: '200ms' }}>
                <Paper elevation={24} sx={{ 
                  p: 4, 
                  borderRadius: 4, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: '#667eea', mr: 2, width: 56, height: 56 }}>
                      <BusinessIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="h5" fontWeight={700} color="#667eea">
                      Site Information
                    </Typography>
                  </Box>
                  
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Client ID"
                          variant="outlined"
                          value={formData.clientId}
                          onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': { borderColor: '#667eea' },
                              '&.Mui-focused fieldset': { borderColor: '#667eea' }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Client Name"
                          variant="outlined"
                          value={formData.clientName}
                          onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': { borderColor: '#667eea' },
                              '&.Mui-focused fieldset': { borderColor: '#667eea' }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Address"
                          variant="outlined"
                          multiline
                          rows={3}
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': { borderColor: '#667eea' },
                              '&.Mui-focused fieldset': { borderColor: '#667eea' }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Contact Person"
                          variant="outlined"
                          value={formData.contactPerson}
                          onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': { borderColor: '#667eea' },
                              '&.Mui-focused fieldset': { borderColor: '#667eea' }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          variant="outlined"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': { borderColor: '#667eea' },
                              '&.Mui-focused fieldset': { borderColor: '#667eea' }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          type="email"
                          variant="outlined"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': { borderColor: '#667eea' },
                              '&.Mui-focused fieldset': { borderColor: '#667eea' }
                            }
                          }}
                        />
                      </Grid>

                      {/* Budget Configuration Section */}
                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }}>
                          <Chip 
                            icon={<AttachMoneyIcon />}
                            label="Budget Configuration" 
                            color="primary"
                            sx={{ fontWeight: 600 }}
                          />
                        </Divider>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Monthly Budget (₹)"
                          type="number"
                          variant="outlined"
                          value={formData.monthlyBudget}
                          onChange={(e) => setFormData({...formData, monthlyBudget: e.target.value})}
                          InputProps={{
                            startAdornment: <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>₹</Typography>
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': { borderColor: '#667eea' },
                              '&.Mui-focused fieldset': { borderColor: '#667eea' }
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Budget Alert Threshold</InputLabel>
                          <Select
                            value={formData.budgetAlertThreshold}
                            label="Budget Alert Threshold"
                            onChange={(e) => setFormData({...formData, budgetAlertThreshold: e.target.value})}
                          >
                            <MenuItem value={70}>70% - Early Warning</MenuItem>
                            <MenuItem value={80}>80% - Standard Alert</MenuItem>
                            <MenuItem value={90}>90% - Critical Alert</MenuItem>
                            <MenuItem value={95}>95% - Emergency Alert</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Vehicle KM Limit"
                          type="number"
                          variant="outlined"
                          value={formData.vehicleKmLimit}
                          onChange={(e) => setFormData({...formData, vehicleKmLimit: e.target.value})}
                          InputProps={{
                            endAdornment: <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>KM</Typography>
                          }}
                          helperText="Monthly vehicle kilometer limit for this site"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': { borderColor: '#667eea' },
                              '&.Mui-focused fieldset': { borderColor: '#667eea' }
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="h6" fontWeight={600} color="#667eea" gutterBottom>
                          Category-wise Budget Allocation
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Set individual budgets for each expense category
                        </Typography>
                      </Grid>

                      {categoryBudgets.map((category, index) => (
                        <Grid item xs={12} sm={6} key={category.category}>
                          <TextField
                            fullWidth
                            label={`${category.category} Budget (₹)`}
                            type="number"
                            variant="outlined"
                            value={category.budget}
                            onChange={(e) => handleCategoryBudgetChange(index, 'budget', e.target.value)}
                            InputProps={{
                              startAdornment: <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>₹</Typography>
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': { borderColor: '#667eea' },
                                '&.Mui-focused fieldset': { borderColor: '#667eea' }
                              }
                            }}
                          />
                        </Grid>
                      ))}

                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: 'rgba(102, 126, 234, 0.1)', 
                          borderRadius: 2, 
                          border: '1px solid rgba(102, 126, 234, 0.2)' 
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AttachMoneyIcon sx={{ color: '#667eea', mr: 1 }} />
                            <Typography variant="h6" fontWeight={600} color="#667eea">
                              Budget Summary
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Total Allocated Budget: ₹{categoryBudgets.reduce((sum, cat) => sum + (parseFloat(cat.budget) || 0), 0).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Alert Threshold: {formData.budgetAlertThreshold}% of budget utilization
                          </Typography>
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
                            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                            borderRadius: 3,
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
                            }
                          }}
                        >
                          Create Site with Budget Configuration
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

export default CreateSite; 