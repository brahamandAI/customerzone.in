import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Switch, FormControlLabel, Fade, Zoom, Divider, Button, TextField, FormControl, InputLabel, Select, MenuItem, Chip, Avatar } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import PaletteIcon from '@mui/icons-material/Palette';
import LanguageIcon from '@mui/icons-material/Language';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const Settings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    budgetAlerts: true,
    approvalReminders: true,
    darkMode: false,
    language: 'en',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    autoLogout: 30,
    twoFactorAuth: true
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    console.log('Settings saved:', settings);
    // Here you would save to backend
  };

  const handleReset = () => {
    setSettings({
      emailNotifications: true,
      smsNotifications: false,
      budgetAlerts: true,
      approvalReminders: true,
      darkMode: false,
      language: 'en',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      autoLogout: 30,
      twoFactorAuth: true
    });
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
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        animation: 'float 20s ease-in-out infinite',
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        }
      }} />
      
      <Fade in timeout={1000}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant="h3" fontWeight={900} color="white" sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              Settings & Preferences
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={handleReset}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  '&:hover': { borderColor: 'white' }
                }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  '&:hover': { background: 'rgba(255,255,255,0.3)' }
                }}
              >
                Save Changes
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Notifications */}
            <Grid item xs={12} md={6}>
              <Zoom in style={{ transitionDelay: '200ms' }}>
                <Paper elevation={16} sx={{ 
                  p: 4, 
                  borderRadius: 3, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  height: 'fit-content'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: '#667eea', mr: 2 }}>
                      <NotificationsIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600} color="#667eea">
                      Notifications
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={settings.emailNotifications}
                          onChange={() => handleToggle('emailNotifications')}
                          color="primary"
                        />
                      }
                      label="Email Notifications"
                    />
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={settings.smsNotifications}
                          onChange={() => handleToggle('smsNotifications')}
                          color="primary"
                        />
                      }
                      label="SMS Notifications"
                    />
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={settings.budgetAlerts}
                          onChange={() => handleToggle('budgetAlerts')}
                          color="primary"
                        />
                      }
                      label="Budget Alerts"
                    />
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={settings.approvalReminders}
                          onChange={() => handleToggle('approvalReminders')}
                          color="primary"
                        />
                      }
                      label="Approval Reminders"
                    />
                  </Box>
                </Paper>
              </Zoom>
            </Grid>

            {/* Security */}
            <Grid item xs={12} md={6}>
              <Zoom in style={{ transitionDelay: '400ms' }}>
                <Paper elevation={16} sx={{ 
                  p: 4, 
                  borderRadius: 3, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  height: 'fit-content'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: '#f44336', mr: 2 }}>
                      <SecurityIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600} color="#f44336">
                      Security
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={settings.twoFactorAuth}
                          onChange={() => handleToggle('twoFactorAuth')}
                          color="error"
                        />
                      }
                      label="Two-Factor Authentication"
                    />
                    
                    <FormControl fullWidth>
                      <InputLabel>Auto Logout (minutes)</InputLabel>
                      <Select
                        value={settings.autoLogout}
                        label="Auto Logout (minutes)"
                        onChange={(e) => setSettings({...settings, autoLogout: e.target.value})}
                      >
                        <MenuItem value={15}>15 minutes</MenuItem>
                        <MenuItem value={30}>30 minutes</MenuItem>
                        <MenuItem value={60}>1 hour</MenuItem>
                        <MenuItem value={120}>2 hours</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Paper>
              </Zoom>
            </Grid>

            {/* Appearance */}
            <Grid item xs={12} md={6}>
              <Zoom in style={{ transitionDelay: '600ms' }}>
                <Paper elevation={16} sx={{ 
                  p: 4, 
                  borderRadius: 3, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  height: 'fit-content'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: '#ff9800', mr: 2 }}>
                      <PaletteIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600} color="#ff9800">
                      Appearance
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={settings.darkMode}
                          onChange={() => handleToggle('darkMode')}
                          color="warning"
                        />
                      }
                      label="Dark Mode"
                    />
                    
                    <FormControl fullWidth>
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={settings.language}
                        label="Language"
                        onChange={(e) => setSettings({...settings, language: e.target.value})}
                      >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="hi">Hindi</MenuItem>
                        <MenuItem value="gu">Gujarati</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Paper>
              </Zoom>
            </Grid>

            {/* Regional */}
            <Grid item xs={12} md={6}>
              <Zoom in style={{ transitionDelay: '800ms' }}>
                <Paper elevation={16} sx={{ 
                  p: 4, 
                  borderRadius: 3, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  height: 'fit-content'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: '#4caf50', mr: 2 }}>
                      <LanguageIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600} color="#4caf50">
                      Regional Settings
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel>Timezone</InputLabel>
                      <Select
                        value={settings.timezone}
                        label="Timezone"
                        onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                      >
                        <MenuItem value="Asia/Kolkata">Asia/Kolkata (IST)</MenuItem>
                        <MenuItem value="Asia/Dubai">Asia/Dubai (GST)</MenuItem>
                        <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <FormControl fullWidth>
                      <InputLabel>Currency</InputLabel>
                      <Select
                        value={settings.currency}
                        label="Currency"
                        onChange={(e) => setSettings({...settings, currency: e.target.value})}
                      >
                        <MenuItem value="INR">Indian Rupee (₹)</MenuItem>
                        <MenuItem value="USD">US Dollar ($)</MenuItem>
                        <MenuItem value="EUR">Euro (€)</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Paper>
              </Zoom>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Box>
  );
};

export default Settings; 