import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Grid, Avatar, Fade, Zoom, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import AddIcon from '@mui/icons-material/Add';

const CreateSubmitter = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    assignedSites: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitter data:', formData);
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
        background: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.04"%3E%3Ccircle cx="50" cy="50" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        animation: 'slide 25s linear infinite',
        '@keyframes slide': {
          '0%': { transform: 'translateX(0px)' },
          '100%': { transform: 'translateX(-100px)' }
        }
      }} />
      
      <Fade in timeout={1000}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight={900} color="white" textAlign="center" gutterBottom sx={{ mb: 4, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            Create New Submitter
          </Typography>
          
          <Grid container justifyContent="center">
            <Grid item xs={12} md={10} lg={8}>
              <Zoom in style={{ transitionDelay: '400ms' }}>
                <Paper elevation={24} sx={{ 
                  p: 4, 
                  borderRadius: 4, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: '#4facfe', mr: 2, width: 56, height: 56 }}>
                      <PersonAddAltIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="h5" fontWeight={700} color="#4facfe">
                      Submitter Information
                    </Typography>
                  </Box>
                  
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          variant="outlined"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': { borderColor: '#4facfe' },
                              '&.Mui-focused fieldset': { borderColor: '#4facfe' }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          type="email"
                          variant="outlined"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': { borderColor: '#4facfe' },
                              '&.Mui-focused fieldset': { borderColor: '#4facfe' }
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
                              '&:hover fieldset': { borderColor: '#4facfe' },
                              '&.Mui-focused fieldset': { borderColor: '#4facfe' }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Role</InputLabel>
                          <Select
                            value={formData.role}
                            label="Role"
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': { borderColor: '#4facfe' },
                                '&.Mui-focused fieldset': { borderColor: '#4facfe' }
                              }
                            }}
                          >
                            <MenuItem value="submitter">Submitter</MenuItem>
                            <MenuItem value="approver_l1">Approver L1</MenuItem>
                            <MenuItem value="approver_l2">Approver L2</MenuItem>
                            <MenuItem value="approver_l3">Approver L3</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="h6" fontWeight={600} color="#4facfe" gutterBottom sx={{ mt: 2 }}>
                          Bank Details
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Bank Name"
                          variant="outlined"
                          value={formData.bankName}
                          onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': { borderColor: '#4facfe' },
                              '&.Mui-focused fieldset': { borderColor: '#4facfe' }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Account Number"
                          variant="outlined"
                          value={formData.accountNumber}
                          onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': { borderColor: '#4facfe' },
                              '&.Mui-focused fieldset': { borderColor: '#4facfe' }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="IFSC Code"
                          variant="outlined"
                          value={formData.ifscCode}
                          onChange={(e) => setFormData({...formData, ifscCode: e.target.value})}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': { borderColor: '#4facfe' },
                              '&.Mui-focused fieldset': { borderColor: '#4facfe' }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          fullWidth
                          startIcon={<AddIcon />}
                          sx={{
                            background: 'linear-gradient(45deg, #4facfe 30%, #00f2fe 90%)',
                            borderRadius: 3,
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 12px 40px rgba(79, 172, 254, 0.4)'
                            }
                          }}
                        >
                          Create Submitter
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

export default CreateSubmitter; 