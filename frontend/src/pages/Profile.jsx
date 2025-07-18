import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Grid, Avatar, Fade, Zoom, Card, CardContent, IconButton, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import SecurityIcon from '@mui/icons-material/Security';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Aastha',
    email: 'aastha@rakshaksecuritas.com',
    phone: '+91 98765 43210',
    role: 'Admin',
    department: 'Finance',
    employeeId: 'RS001',
    joinDate: '2023-01-15',
    bankName: 'HDFC Bank',
    accountNumber: 'XXXX XXXX 1234',
    ifscCode: 'HDFC0001234'
  });

  const stats = [
    { label: 'Total Expenses', value: '₹45,000', icon: '💰' },
    { label: 'Pending Approvals', value: '8', icon: '⏳' },
    { label: 'Approved This Month', value: '₹12,500', icon: '✅' },
    { label: 'Sites Managed', value: '5', icon: '🏢' }
  ];

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
    console.log('Profile data saved:', profileData);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #008080 0%, #20B2AA 100%)',
      p: 4,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        animation: 'float 20s ease-in-out infinite',
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        }
      }} />
      
      <Fade in timeout={1000}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight={900} color="white" textAlign="center" gutterBottom sx={{ mb: 4, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            My Profile
          </Typography>
          
          <Grid container spacing={3}>
            {/* Profile Header */}
            <Grid item xs={12}>
              <Zoom in style={{ transitionDelay: '200ms' }}>
                <Paper elevation={24} sx={{ 
                  p: 4, 
                  borderRadius: 4, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: '#667eea', fontSize: '2rem' }}>
                        {profileData.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight={700} color="#667eea">
                          {profileData.name}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                          {profileData.role} • {profileData.department}
                        </Typography>
                        <Chip label={profileData.employeeId} color="primary" size="small" sx={{ mt: 1 }} />
                      </Box>
                    </Box>
                    <IconButton 
                      onClick={() => setIsEditing(!isEditing)}
                      sx={{ 
                        bgcolor: isEditing ? '#f44336' : '#667eea',
                        color: 'white',
                        '&:hover': { bgcolor: isEditing ? '#d32f2f' : '#5a6fd8' }
                      }}
                    >
                      {isEditing ? <CancelIcon /> : <EditIcon />}
                    </IconButton>
                  </Box>
                </Paper>
              </Zoom>
            </Grid>

            {/* Stats Cards */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {stats.map((stat, index) => (
                  <Grid item xs={12} sm={6} md={3} key={stat.label}>
                    <Zoom in style={{ transitionDelay: `${400 + index * 100}ms` }}>
                      <Card elevation={8} sx={{ 
                        borderRadius: 3, 
                        background: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(10px)',
                        transition: '0.3s',
                        '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }
                      }}>
                        <CardContent sx={{ textAlign: 'center', p: 3 }}>
                          <Typography variant="h2" sx={{ mb: 1 }}>{stat.icon}</Typography>
                          <Typography variant="h5" fontWeight={700} color="#667eea" gutterBottom>
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {stat.label}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Profile Details */}
            <Grid item xs={12} md={6}>
              <Zoom in style={{ transitionDelay: '600ms' }}>
                <Paper elevation={16} sx={{ 
                  p: 4, 
                  borderRadius: 4, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  height: 'fit-content'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <AccountCircleIcon sx={{ color: '#667eea', mr: 2, fontSize: 28 }} />
                    <Typography variant="h6" fontWeight={600} color="#667eea">
                      Personal Information
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        variant="outlined"
                        value={profileData.name}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        InputProps={{
                          startAdornment: <AccountCircleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        variant="outlined"
                        value={profileData.email}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        InputProps={{
                          startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Phone"
                        variant="outlined"
                        value={profileData.phone}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        InputProps={{
                          startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Department"
                        variant="outlined"
                        value={profileData.department}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                        InputProps={{
                          startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Zoom>
            </Grid>

            {/* Bank Details */}
            <Grid item xs={12} md={6}>
              <Zoom in style={{ transitionDelay: '800ms' }}>
                <Paper elevation={16} sx={{ 
                  p: 4, 
                  borderRadius: 4, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  height: 'fit-content'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <SecurityIcon sx={{ color: '#667eea', mr: 2, fontSize: 28 }} />
                    <Typography variant="h6" fontWeight={600} color="#667eea">
                      Bank Details
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Bank Name"
                        variant="outlined"
                        value={profileData.bankName}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData({...profileData, bankName: e.target.value})}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Account Number"
                        variant="outlined"
                        value={profileData.accountNumber}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData({...profileData, accountNumber: e.target.value})}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="IFSC Code"
                        variant="outlined"
                        value={profileData.ifscCode}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData({...profileData, ifscCode: e.target.value})}
                      />
                    </Grid>
                  </Grid>
                  
                  {isEditing && (
                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        sx={{
                          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                          borderRadius: 2,
                          px: 3
                        }}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setIsEditing(false)}
                        sx={{ borderRadius: 2, px: 3 }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Zoom>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Box>
  );
};

export default Profile; 