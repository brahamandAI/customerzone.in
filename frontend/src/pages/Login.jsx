import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Fade, Zoom, Avatar, InputAdornment, IconButton, FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import BusinessIcon from '@mui/icons-material/Business';
import SecurityIcon from '@mui/icons-material/Security';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import { GoogleLogin } from '@react-oauth/google';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const { login, getRoleDisplayName } = useAuth();
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'submitter',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState([]);
  const [openForgotPasswordDialog, setOpenForgotPasswordDialog] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');

  // Generate floating particles
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.3 + 0.1
      }));
      setParticles(newParticles);
    };

    generateParticles();
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        y: p.y - p.speed,
        x: p.x + Math.sin(p.y / 50) * 0.5
      })));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    setLoading(true);
    
    try {
      // Call real backend login API
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });

      // Save token and user in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      login(response.data.user, response.data.token); // update context with token
      navigate('/dashboard');
    } catch (error) {
      setErrors({ email: 'Invalid credentials' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (credentialResponse) => {
    console.log('🔐 Google Sign-In initiated:', credentialResponse);
    setLoading(true);
    
    try {
      // Call backend Google OAuth API with the credential token
      const response = await authAPI.googleSignIn({
        token: credentialResponse.credential
      });

      console.log('✅ Google Sign-In successful:', response.data);

      // Save token and user in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      setErrors({ email: error.response?.data?.message || 'Google sign-in failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google Sign-In Error');
    setErrors({ email: 'Google sign-in was cancelled or failed. Please try again.' });
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setForgotPasswordError('Email is required to reset password.');
      return;
    }

    setLoading(true);
    setForgotPasswordError('');
    setForgotPasswordSuccess('');

    try {
      await authAPI.forgotPassword(forgotPasswordEmail);
      setForgotPasswordSuccess('Password reset instructions have been sent to your email.');
      setOpenForgotPasswordDialog(false);
      setForgotPasswordEmail('');
    } catch (error) {
      setForgotPasswordError(error.response?.data?.message || 'Failed to send password reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseForgotPasswordDialog = () => {
    setOpenForgotPasswordDialog(false);
    setForgotPasswordEmail('');
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'l1_approver': return <SecurityIcon />;
      case 'l2_approver': return <BusinessIcon />;
            case 'l3_approver': return <AccountBalanceIcon />;
      case 'finance': return <AccountBalanceIcon />;

      default: return <PersonIcon />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'l1_approver': return '#ff9800';
      case 'l2_approver': return '#9c27b0';
            case 'l3_approver': return '#4caf50';
      case 'finance': return '#4caf50';

      default: return '#607d8b';
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #008080 0%, #20B2AA 50%, #48D1CC 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 4,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating Particles */}
      {particles.map(particle => (
        <Box
          key={particle.id}
          sx={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            background: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '50%',
            opacity: particle.opacity,
            animation: 'float 6s ease-in-out infinite',
            zIndex: 0,
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(-20px) rotate(180deg)' }
            }
          }}
        />
      ))}

      {/* Animated background patterns */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(255,255,255,0.05) 0%, transparent 50%)
        `,
        animation: 'pulse 4s ease-in-out infinite',
        '@keyframes pulse': {
          '0%, 100%': { opacity: 0.5 },
          '50%': { opacity: 1 }
        }
      }} />

      {/* Floating geometric shapes */}
      <Box sx={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        width: 100,
        height: 100,
        border: '2px solid rgba(255,255,255,0.2)',
        borderRadius: '50%',
        animation: 'rotate 20s linear infinite',
        '@keyframes rotate': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      }} />
      
      <Box sx={{
        position: 'absolute',
        bottom: '15%',
        left: '15%',
        width: 60,
        height: 60,
        border: '2px solid rgba(255,255,255,0.3)',
        borderRadius: '50%',
        animation: 'rotate 15s linear infinite reverse',
      }} />

      <Fade in timeout={1000}>
        <Box sx={{ 
          position: 'relative', 
          zIndex: 1, 
          width: '100%', 
          maxWidth: 1200,
          display: 'flex',
          gap: 0,
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          {/* Left Side - Login Form */}
          <Zoom in style={{ transitionDelay: '200ms' }}>
            <Paper elevation={24} sx={{ 
              flex: 1,
              p: 5, 
              background: darkMode ? 'rgba(26,26,26,0.95)' : 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              border: darkMode ? '1px solid rgba(51,51,51,0.3)' : '1px solid rgba(255,255,255,0.3)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #008080, #20B2AA, #48D1CC)',
                borderRadius: '4px 4px 0 0'
              }
            }}>
              {/* Login Form Header */}
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.8 }}>
                  Sign in to your account to continue
                </Typography>
              </Box>

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    error={!!errors.email}
                    helperText={errors.email}
                    FormHelperTextProps={{
                      sx: { color: errors.email ? '#f44336' : (darkMode ? '#b0b0b0' : '#666666') }
                    }}
                    InputProps={{
                      sx: { 
                        borderRadius: 3,
                        backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                        color: darkMode ? '#ffffff' : '#333333',
                        '&:hover fieldset': { borderColor: '#008080' },
                        '&.Mui-focused fieldset': { borderColor: '#008080' },
                        '& .MuiInputBase-input': {
                          color: darkMode ? '#ffffff' : '#333333',
                        },
                        '& .MuiInputLabel-root': {
                          color: darkMode ? '#b0b0b0' : '#666666',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#008080',
                        }
                      }
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    error={!!errors.password}
                    helperText={errors.password}
                    FormHelperTextProps={{
                      sx: { color: errors.password ? '#f44336' : (darkMode ? '#b0b0b0' : '#666666') }
                    }}
                    InputProps={{
                      sx: { 
                        borderRadius: 3,
                        backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                        color: darkMode ? '#ffffff' : '#333333',
                        '&:hover fieldset': { borderColor: '#008080' },
                        '&.Mui-focused fieldset': { borderColor: '#008080' },
                        '& .MuiInputBase-input': {
                          color: darkMode ? '#ffffff' : '#333333',
                        },
                        '& .MuiInputLabel-root': {
                          color: darkMode ? '#b0b0b0' : '#666666',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#008080',
                        }
                      },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: '#008080' }}
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  
                  <FormControl fullWidth>
                    <InputLabel sx={{ 
                      color: darkMode ? '#b0b0b0' : '#666666',
                      '&.Mui-focused': { color: '#008080' }
                    }}>Select Your Role</InputLabel>
                    <Select
                      value={formData.role}
                      label="Select Your Role"
                      onChange={handleInputChange('role')}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                            '& .MuiMenuItem-root': {
                              backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                              '&:hover': {
                                backgroundColor: darkMode ? '#3a3a3a' : '#f5f5f5'
                              }
                            }
                          }
                        }
                      }}
                      sx={{ 
                        borderRadius: 3,
                        backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                        color: darkMode ? '#ffffff' : '#333333',
                        '&:hover fieldset': { borderColor: '#008080' },
                        '&.Mui-focused fieldset': { borderColor: '#008080' },
                        '& .MuiSelect-icon': {
                          color: darkMode ? '#ffffff' : '#333333',
                        },
                        '& .MuiInputBase-input': {
                          color: darkMode ? '#ffffff' : '#333333',
                        }
                      }}
                      renderValue={(value) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ 
                            width: 24, 
                            height: 24, 
                            bgcolor: getRoleColor(value),
                            fontSize: '0.8rem'
                          }}>
                            {getRoleIcon(value)}
                          </Avatar>
                          <Typography sx={{ color: darkMode ? '#ffffff' : '#333333' }}>{getRoleDisplayName(value)}</Typography>
                        </Box>
                      )}
                    >
                      <MenuItem value="submitter" sx={{ 
                        backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                        '&:hover': { backgroundColor: darkMode ? '#3a3a3a' : '#f5f5f5' }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#2196f3' }}>
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ color: darkMode ? '#ffffff' : '#333333' }}>Expense Submitter</Typography>
                            <Typography variant="caption" sx={{ color: darkMode ? '#b0b0b0' : '#666666' }}>Submit and track expenses</Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                      <MenuItem value="l1_approver" sx={{ 
                        backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                        '&:hover': { backgroundColor: darkMode ? '#3a3a3a' : '#f5f5f5' }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#ff9800' }}>
                            <SecurityIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ color: darkMode ? '#ffffff' : '#333333' }}>Level 1 Approver</Typography>
                            <Typography variant="caption" sx={{ color: darkMode ? '#b0b0b0' : '#666666' }}>Regional Manager</Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                      <MenuItem value="l2_approver" sx={{ 
                        backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                        '&:hover': { backgroundColor: darkMode ? '#3a3a3a' : '#f5f5f5' }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#9c27b0' }}>
                            <BusinessIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ color: darkMode ? '#ffffff' : '#333333' }}>Level 2 Approver</Typography>
                            <Typography variant="caption" sx={{ color: darkMode ? '#b0b0b0' : '#666666' }}>Admin</Typography>
                          </Box>
                        </Box>
                      </MenuItem>

                      <MenuItem value="l3_approver" sx={{ 
                        backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                        '&:hover': { backgroundColor: darkMode ? '#3a3a3a' : '#f5f5f5' }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#4caf50' }}>
                            <AccountBalanceIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ color: darkMode ? '#ffffff' : '#333333' }}>Super Admin</Typography>
                            <Typography variant="caption" sx={{ color: darkMode ? '#b0b0b0' : '#666666' }}>Full Access</Typography>
                          </Box>
                        </Box>
                      </MenuItem>

                      <MenuItem value="finance" sx={{ 
                        backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                        '&:hover': { backgroundColor: darkMode ? '#3a3a3a' : '#f5f5f5' }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#4caf50' }}>
                            <AccountBalanceIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ color: darkMode ? '#ffffff' : '#333333' }}>Finance</Typography>
                            <Typography variant="caption" sx={{ color: darkMode ? '#b0b0b0' : '#666666' }}>Payment Processing</Typography>
                          </Box>
                        </Box>
                      </MenuItem>

                    </Select>
                  </FormControl>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.rememberMe}
                          onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                          sx={{ color: '#008080', '&.Mui-checked': { color: '#008080' } }}
                        />
                      }
                      label={<Typography sx={{ color: darkMode ? '#ffffff' : '#333333' }}>Remember me</Typography>}
                    />
                    <Button
                      variant="text"
                      sx={{ 
                        textTransform: 'none',
                        color: '#008080',
                        '&:hover': { background: 'rgba(0,128,128,0.1)' }
                      }}
                      onClick={() => setOpenForgotPasswordDialog(true)}
                    >
                      Forgot password?
                    </Button>
                  </Box>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={loading}
                    startIcon={<LockIcon />}
                    sx={{
                      py: 2,
                      borderRadius: 3,
                      background: 'linear-gradient(45deg, #008080 30%, #20B2AA 90%)',
                      color: 'white',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: '0 8px 32px rgba(0,128,128,0.3)',
                      '&:hover': { 
                        background: 'linear-gradient(45deg, #006666 30%, #008080 90%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(0,128,128,0.4)'
                      },
                      '&:disabled': {
                        background: 'rgba(0,128,128,0.3)',
                        transform: 'none'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>

                  <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" sx={{ color: darkMode ? '#b0b0b0' : '#666666' }}>
                      OR
                    </Typography>
                  </Divider>

                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    '& .google-login-button': {
                      width: '100%',
                      '& div': {
                        width: '100% !important',
                        borderRadius: '12px !important',
                        height: '56px !important',
                        display: 'flex !important',
                        alignItems: 'center !important',
                        justifyContent: 'center !important',
                        fontSize: '1.1rem !important',
                        fontWeight: '600 !important',
                        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif !important',
                        textTransform: 'none !important',
                        transition: 'all 0.3s ease !important',
                        '&:hover': {
                          transform: 'translateY(-2px) !important',
                          boxShadow: '0 4px 12px rgba(66, 133, 244, 0.3) !important'
                        }
                      }
                    }
                  }}>
                    {/* Debug: Show client ID status */}
                    {!process.env.REACT_APP_GOOGLE_CLIENT_ID && (
                      <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                        ⚠️ Google Client ID not configured. Please check your .env file.
                      </Typography>
                    )}
                    <GoogleLogin
                      onSuccess={handleGoogleSignIn}
                      onError={handleGoogleError}
                      theme="outline"
                      size="large"
                      text="signin_with"
                      shape="rectangular"
                      className="google-login-button"
                      disabled={loading}
                    />
                  </Box>
                </Box>
              </form>

              {/* Demo Credentials */}
              <Box sx={{ 
                mt: 4, 
                p: 3, 
                bgcolor: 'rgba(0,128,128,0.1)', 
                borderRadius: 3,
                border: '1px solid rgba(0,128,128,0.2)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, #008080, #20B2AA)'
                }
              }}>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                  🚀 Demo Credentials:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600 }}>
                      👤 Expense Submitter
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      📧 submitter@rakshaksecuritas.com
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      🔑 Password: submitter123
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600 }}>
                      🛡️ Level 1 Approver (Regional Manager)
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      📧 l1approver@rakshaksecuritas.com
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      🔑 Password: l1approver123
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600 }}>
                      🏢 Level 2 Approver (Admin)
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      📧 l2approver@rakshaksecuritas.com
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      🔑 Password: l2approver123
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600 }}>
                      💰 Level 3 Approver (Finance)
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      📧 l3approver@rakshaksecuritas.com
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      🔑 Password: l3approver123
                    </Typography>
                  </Box>
                  

                </Box>
              </Box>
            </Paper>
          </Zoom>

          {/* Right Side - Company Details */}
          <Zoom in style={{ transitionDelay: '400ms' }}>
            <Paper elevation={24} sx={{ 
              flex: 1,
              background: 'linear-gradient(135deg, #008080 0%, #20B2AA 100%)',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 6,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                animation: 'float 20s ease-in-out infinite'
              }
            }}>
              {/* Company Logo */}
              <Box sx={{ 
                mb: 4, 
                width: 200, 
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                animation: 'bounce 2s ease-in-out infinite',
                '@keyframes bounce': {
                  '0%, 100%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-10px)' }
                }
              }}>
                <Box sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                  animation: 'pulse 2s ease-in-out infinite'
                }} />
                <img 
                  src="/rakshak-logo.png" 
                  alt="Rakshak Securitas Logo" 
                  style={{ 
                    height: '120px', 
                    width: 'auto',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                  }}
                />
              </Box>

              {/* Company Name */}
              <Typography variant="h2" fontWeight={900} gutterBottom sx={{
                textAlign: 'center',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 2,
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' }
              }}>
                Rakshak Securitas
              </Typography>

              {/* Company Tagline */}
              <Typography variant="h5" sx={{ 
                mb: 3, 
                textAlign: 'center',
                opacity: 0.9,
                fontWeight: 600,
                fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' }
              }}>
                Expense Management System
              </Typography>

              {/* Company Description */}
              <Typography variant="body1" sx={{ 
                textAlign: 'center',
                mb: 4,
                opacity: 0.8,
                maxWidth: 400,
                lineHeight: 1.6
              }}>
                Leading security services provider with comprehensive expense management solutions. 
                Streamline your financial processes with our advanced expense tracking system.
              </Typography>

              {/* Key Features */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: 'white',
                    opacity: 0.8
                  }} />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Multi-level approval workflow
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: 'white',
                    opacity: 0.8
                  }} />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Real-time budget monitoring
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: 'white',
                    opacity: 0.8
                  }} />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Advanced reporting & analytics
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: 'white',
                    opacity: 0.8
                  }} />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Secure & compliant platform
                  </Typography>
                </Box>
              </Box>

              {/* Contact Info */}
              <Box sx={{ 
                p: 3, 
                bgcolor: 'rgba(255,255,255,0.1)', 
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.2)',
                textAlign: 'center'
              }}>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontWeight: 600 }}>
                  Rakshak Securitas
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  📧 info@rakshaksecuritas.com
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  📞 +91 98765 43210
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                  🌐 www.rakshaksecuritas.com
                </Typography>
                
                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.3)' }} />
                
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontWeight: 600 }}>
                  Developed by ROBUSTRIX
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  📧 info@therobustrix.com
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  📞 +91 9090020245
                </Typography>
              </Box>

              {/* Footer */}
              <Box sx={{ 
                mt: 4, 
                pt: 3, 
                borderTop: '1px solid rgba(255,255,255,0.2)',
                textAlign: 'center'
              }}>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  © 2025 Rakshak Securitas. All rights reserved.
                </Typography>
                <Typography variant="caption" display="block" sx={{ opacity: 0.6, mt: 0.5 }}>
                  Crafted by ROBUSTRIX – Empowering seamless expense management.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1 }}>
                  <Typography variant="caption" sx={{ opacity: 0.6 }}>
                    📧 info@therobustrix.com
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.6 }}>
                    📞 +91 9090020245
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Zoom>
        </Box>
      </Fade>

      {/* Forgot Password Dialog */}
      <Dialog open={openForgotPasswordDialog} onClose={handleCloseForgotPasswordDialog} PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ textAlign: 'center', py: 3 }}>
          <LockIcon sx={{ fontSize: 60, color: '#008080' }} />
          <Typography variant="h5" sx={{ mt: 2 }}>
            Forgot Password?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Enter your email address to receive a password reset link.
          </Typography>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
            error={!!forgotPasswordError}
            helperText={forgotPasswordError}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: '#008080' }} />
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />
          {forgotPasswordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {forgotPasswordSuccess}
            </Alert>
          )}
          {forgotPasswordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {forgotPasswordError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3 }}>
          <Button
            variant="outlined"
            onClick={handleCloseForgotPasswordDialog}
            sx={{ color: '#008080', borderColor: '#008080' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleForgotPassword}
            disabled={loading}
            sx={{
              background: 'linear-gradient(45deg, #008080 30%, #20B2AA 90%)',
              '&:hover': { background: 'linear-gradient(45deg, #006666 30%, #008080 90%)' },
              '&:disabled': {
                background: 'rgba(0,128,128,0.3)',
                transform: 'none'
              }
            }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login; 