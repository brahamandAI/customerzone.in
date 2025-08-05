import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, FormControl, Select, MenuItem, Button, Fade, Zoom, Avatar, Card, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress, Snackbar, Tabs, Tab } from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useNavigate } from 'react-router-dom';
import { expenseAPI, siteAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AttachmentViewer from '../components/AttachmentViewer';

const ExpenseForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  
  // All hooks must be called before any conditional logic
  const [attachments, setAttachments] = useState([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [sites, setSites] = useState([]);
  const [viewAttachments, setViewAttachments] = useState(false);
  const [currentExpenseId, setCurrentExpenseId] = useState(null);
  
  // Generate expense number helper function
  const generateExpenseNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Month with leading zero
    const day = now.getDate().toString().padStart(2, '0'); // Day with leading zero
    const hours = now.getHours().toString().padStart(2, '0'); // Hours with leading zero
    const minutes = now.getMinutes().toString().padStart(2, '0'); // Minutes with leading zero
    
    // Generate sequential number based on current time
    const sequentialNumber = parseInt(hours + minutes);
    return `EXP-${sequentialNumber.toString().padStart(4, '0')}`; // Pad with zeros to make it 4 digits
  };
  
  // formData state - moved here to follow Rules of Hooks
  const [formData, setFormData] = useState({
    expenseNumber: generateExpenseNumber(),
    title: '',
    description: '',
    amount: '',
    currency: 'INR',
    category: 'Vehicle KM', // Default to Vehicle KM since this is a vehicle KM form
    subcategory: '',
    expenseDate: '',
    department: '',
    vehicleKm: {
      startKm: '',
      endKm: '',
      totalKm: '',
      vehicleNumber: '',
      purpose: '',
      route: {
        from: '',
        to: '',
        via: []
      },
      ratePerKm: 10
    },
    travel: {
      from: '',
      to: '',
      travelDate: '',
      returnDate: '',
      mode: '',
      bookingReference: '',
      passengerName: ''
    },
    accommodation: {
      hotelName: '',
      checkIn: '',
      checkOut: '',
      location: '',
      roomType: '',
      guestName: '',
      bookingReference: ''
    },
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      accountHolderName: ''
    }
  });

  // ALL useEffect hooks must be here before conditional logic
  // Fetch next expense number from backend
  useEffect(() => {
    const fetchNextExpenseNumber = async () => {
      try {
        const response = await expenseAPI.getNextExpenseNumber();
        if (response.data.success) {
          setFormData(prev => ({
            ...prev,
            expenseNumber: response.data.data.expenseNumber
          }));
        }
      } catch (error) {
        console.error('Error fetching next expense number:', error);
        // Fallback to local generation if API fails
        setFormData(prev => ({
          ...prev,
          expenseNumber: generateExpenseNumber()
        }));
      }
    };

    fetchNextExpenseNumber();
  }, []);

  // Fetch sites
  useEffect(() => {
    siteAPI.getAll().then(res => {
      setSites(res.data.data || []);
    });
  }, []);

  // Handle video stream when camera opens
  useEffect(() => {
    if (cameraOpen && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraOpen, stream]);

  // Auto-fill bank details from user profile if available
  useEffect(() => {
    if (user && user.bankDetails) {
      setFormData(prev => ({
        ...prev,
        bankDetails: {
          accountNumber: user.bankDetails.accountNumber || '',
          ifscCode: user.bankDetails.ifscCode || '',
          bankName: user.bankDetails.bankName || '',
          accountHolderName: user.bankDetails.accountHolderName || ''
        }
      }));
    }
  }, [user]);

  // Cleanup stream when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Block L4 Approver from accessing this page - moved after all hooks
  if (user && ['l4_approver', 'L4_APPROVER'].includes(user?.role)) {
    navigate('/dashboard');
    return null;
  }

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      mimetype: file.type, // Add mimetype for AttachmentViewer
      originalName: file.name, // Add originalName for AttachmentViewer
      source: 'file',
      file: file // Add the actual file object
    }));
    setAttachments([...attachments, ...newAttachments]);
  };

  const handleRemoveFile = (fileId) => {
    setAttachments(attachments.filter(file => file.id !== fileId));
  };

  const handleViewAttachments = () => {
    setViewAttachments(true);
  };

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      setStream(mediaStream);
      setCameraOpen(true);
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Camera access is required to take photos. Please allow camera permissions.');
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const fileName = `expense_photo_${Date.now()}.jpg`;
          const file = new File([blob], fileName, { type: 'image/jpeg' });
          
                     const newAttachment = {
             id: Date.now() + Math.random(),
             name: fileName,
             size: file.size,
             type: 'image/jpeg',
             mimetype: 'image/jpeg', // Add mimetype for AttachmentViewer
             originalName: fileName, // Add originalName for AttachmentViewer
             source: 'camera',
             file: file
           };
          
          setAttachments([...attachments, newAttachment]);
          closeCamera();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Validate required fields
    if (!formData.title || !formData.amount || !formData.category) {
      setError('Please fill in all required fields: Title, Amount, and Category');
      setLoading(false);
      return;
    }
    
    try {
      // First upload attachments if any
      const uploadedFiles = [];
      if (attachments.length > 0) {
        for (const attachment of attachments) {
          if (!attachment.file) continue;
          
          try {
            const uploadResult = await expenseAPI.upload(attachment.file);
            if (uploadResult.data.success) {
              uploadedFiles.push({
                filename: uploadResult.data.data.filename,
                originalName: uploadResult.data.data.originalName,
                path: uploadResult.data.data.path,
                size: uploadResult.data.data.size,
                mimetype: uploadResult.data.data.mimetype,
                isReceipt: attachment.isReceipt || false
              });
            }
          } catch (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error('Failed to upload attachments');
          }
        }
      }

      // Prepare expense data using current user info
      const expenseData = {
        expenseNumber: formData.expenseNumber, // Use the sequential number from backend
        title: formData.title,
        description: formData.description || `Vehicle KM expense for ${formData.vehicleKm?.vehicleNumber || 'N/A'}`,
        amount: parseFloat(formData.amount || 0),
        currency: 'INR',
        category: formData.category || 'Vehicle KM', // Default to Vehicle KM if not selected
        expenseDate: new Date().toISOString(),
        submittedById: user?._id || 'current-user-id', // Use current logged in user
        siteId: typeof user?.site === 'string' ? user.site : (user?.site?._id || user?.site?.id || user?.site) || formData.siteId, // Use current user's site
        department: user?.department || formData.department || "Operations",
        vehicleKm: {
          startKm: 0,
          endKm: parseFloat(formData.vehicleKm?.totalKm || 0),
          totalKm: parseFloat(formData.vehicleKm?.totalKm || 0),
          vehicleNumber: formData.vehicleKm?.vehicleNumber || 'Unknown',
          purpose: formData.vehicleKm?.purpose || 'Business Travel',
          route: {
            from: formData.vehicleKm?.route?.from || 'Start',
            to: formData.vehicleKm?.route?.to || 'End',
            via: []
          },
          ratePerKm: 10
        },
        bankDetails: formData.bankDetails,
        attachments: uploadedFiles
      };

      // Log the final payload for debugging
      console.log('User object:', user);
      console.log('User site:', user?.site);
      console.log('Site ID:', user?.site?._id || user?.site?.id);
      console.log('Expense Data Payload:', expenseData);

      // Submit expense using the API service
      const response = await expenseAPI.create(expenseData);
      
      if (response.data.success) {
        setSuccess('Expense submitted successfully!');
        setOpenSnackbar(true);
        
        // Show success message for 2 seconds before redirecting
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to submit expense');
      }

    } catch (error) {
      console.error('Submit error:', error);
      setError(error.message || 'Failed to submit expense');
      setOpenSnackbar(false);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Travel',
    'Food',
    'Accommodation',
    'Vehicle KM',
    'Fuel',
    'Equipment',
    'Maintenance',
    'Office Supplies',
    'Miscellaneous'
  ];



  const paymentMethods = [
    'Cash',
    'Credit Card',
    'Bank Transfer',
    'Cheque',
    'Digital Payment'
  ];

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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <img 
                src="/rakshak-logo.png" 
                alt="Rakshak Securitas Logo" 
                style={{ height: '40px' }}
              />
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <ReceiptIcon />
              </Avatar>
            </Box>
            <Typography variant="h3" fontWeight={900} color="white" sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              Submit Expense Report
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Main Form */}
            <Grid item xs={12} md={8}>
              <Zoom in style={{ transitionDelay: '200ms' }}>
                <Paper elevation={16} sx={{ 
                  p: 4, 
                  borderRadius: 3, 
                  background: darkMode ? 'rgba(26,26,26,0.95)' : 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: darkMode ? '1px solid rgba(51,51,51,0.3)' : '1px solid rgba(255,255,255,0.2)'
                }}>
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      {/* Add Expense Number field at the top */}
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          required
                          label="Expense Number"
                          value={formData.expenseNumber}
                          onChange={handleInputChange('expenseNumber')}
                          placeholder="Enter expense number"
                          helperText="Auto-generated unique expense number"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                              color: darkMode ? '#e0e0e0' : '#333333',
                              borderRadius: 2,
                              '& fieldset': {
                                borderColor: darkMode ? '#333333' : '#e0e0e0',
                              },
                              '&:hover fieldset': {
                                borderColor: darkMode ? '#4fc3f7' : '#667eea',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: darkMode ? '#4fc3f7' : '#667eea',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: darkMode ? '#b0b0b0' : '#666666',
                              '&.Mui-focused': {
                                color: darkMode ? '#4fc3f7' : '#667eea',
                              },
                            },
                            '& .MuiInputBase-input': {
                              color: darkMode ? '#e0e0e0' : '#333333',
                            },
                            '& .MuiFormHelperText-root': {
                              color: darkMode ? '#b0b0b0' : '#666666',
                            },
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          required
                          label="Expense Title"
                          value={formData.title}
                          onChange={handleInputChange('title')}
                          placeholder="Enter expense title"
                          helperText="Enter a descriptive title for this expense"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                              color: darkMode ? '#e0e0e0' : '#333333',
                              borderRadius: 2,
                              '& fieldset': {
                                borderColor: darkMode ? '#333333' : '#e0e0e0',
                              },
                              '&:hover fieldset': {
                                borderColor: darkMode ? '#4fc3f7' : '#667eea',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: darkMode ? '#4fc3f7' : '#667eea',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: darkMode ? '#b0b0b0' : '#666666',
                              '&.Mui-focused': {
                                color: darkMode ? '#4fc3f7' : '#667eea',
                              },
                            },
                            '& .MuiInputBase-input': {
                              color: darkMode ? '#e0e0e0' : '#333333',
                            },
                            '& .MuiFormHelperText-root': {
                              color: darkMode ? '#b0b0b0' : '#666666',
                            },
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <Select
                            value={formData.site || ''}
                            onChange={handleInputChange('site')}
                            required
                            displayEmpty
                            renderValue={(selected) => {
                              if (!selected) {
                                return <em style={{ color: darkMode ? 'rgba(255, 255, 255, 0.38)' : 'rgba(0, 0, 0, 0.38)' }}>Site</em>;
                              }
                              return selected;
                            }}
                            sx={{
                              backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                              color: darkMode ? '#e0e0e0' : '#333333',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: darkMode ? '#333333' : '#e0e0e0',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: darkMode ? '#4fc3f7' : '#667eea',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: darkMode ? '#4fc3f7' : '#667eea',
                              },
                              '& .MuiSelect-icon': {
                                color: darkMode ? '#b0b0b0' : '#666666',
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  bgcolor: darkMode ? '#2a2a2a' : '#ffffff',
                                  '& .MuiMenuItem-root': {
                                    color: darkMode ? '#e0e0e0' : '#333333',
                                    '&:hover': {
                                      bgcolor: darkMode ? '#333333' : '#f5f5f5',
                                    },
                                  },
                                },
                              },
                            }}
                          >
                            <MenuItem value="" disabled>
                              <em>Site</em>
                            </MenuItem>
                            {sites.map(site => (
                              <MenuItem key={site._id} value={site.code}>{site.name}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <Select
                            value={formData.category || ''}
                            onChange={handleInputChange('category')}
                            required
                            displayEmpty
                            renderValue={(selected) => {
                              if (!selected) {
                                return <em style={{ color: darkMode ? 'rgba(255, 255, 255, 0.38)' : 'rgba(0, 0, 0, 0.38)' }}>Category</em>;
                              }
                              return selected;
                            }}
                            sx={{
                              backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                              color: darkMode ? '#e0e0e0' : '#333333',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: darkMode ? '#333333' : '#e0e0e0',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: darkMode ? '#4fc3f7' : '#667eea',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: darkMode ? '#4fc3f7' : '#667eea',
                              },
                              '& .MuiSelect-icon': {
                                color: darkMode ? '#b0b0b0' : '#666666',
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  bgcolor: darkMode ? '#2a2a2a' : '#ffffff',
                                  '& .MuiMenuItem-root': {
                                    color: darkMode ? '#e0e0e0' : '#333333',
                                    '&:hover': {
                                      bgcolor: darkMode ? '#333333' : '#f5f5f5',
                                    },
                                  },
                                },
                              },
                            }}
                          >
                            <MenuItem value="" disabled>
                              <em>Category</em>
                            </MenuItem>
                            {categories.map((category) => (
                              <MenuItem key={category} value={category}>{category}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Amount (₹)"
                          type="number"
                          value={formData.amount}
                          onChange={handleInputChange('amount')}
                          required
                          InputProps={{
                            startAdornment: <Typography variant="body2" color={darkMode ? '#b0b0b0' : 'text.secondary'} sx={{ mr: 1 }}>₹</Typography>
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                              color: darkMode ? '#e0e0e0' : '#333333',
                              '& fieldset': {
                                borderColor: darkMode ? '#333333' : '#e0e0e0',
                              },
                              '&:hover fieldset': {
                                borderColor: darkMode ? '#4fc3f7' : '#667eea',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: darkMode ? '#4fc3f7' : '#667eea',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: darkMode ? '#b0b0b0' : '#666666',
                              '&.Mui-focused': {
                                color: darkMode ? '#4fc3f7' : '#667eea',
                              },
                            },
                            '& .MuiInputBase-input': {
                              color: darkMode ? '#e0e0e0' : '#333333',
                            },
                          }}
                        />
                      </Grid>

                      {/* Vehicle KM Fields - Show only when category is Vehicle KM */}
                      {formData.category === 'Vehicle KM' && (
                        <>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Vehicle KM"
                              type="number"
                              value={formData.vehicleKm}
                              onChange={handleInputChange('vehicleKm')}
                              required
                              InputProps={{
                                endAdornment: <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>KM</Typography>
                              }}
                              helperText="Enter the total kilometers driven"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Allowed KM Limit"
                              type="number"
                              value="1000"
                              InputProps={{
                                readOnly: true,
                                endAdornment: <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>KM</Typography>
                              }}
                              helperText="Site's monthly KM limit"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  backgroundColor: 'rgba(0, 128, 0, 0.1)',
                                  '& fieldset': { borderColor: '#4caf50' }
                                }
                              }}
                            />
                          </Grid>
                          {parseFloat(formData.vehicleKm) > 1000 && (
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Reason for Extra KM"
                                multiline
                                rows={2}
                                value={formData.extraKmReason}
                                onChange={handleInputChange('extraKmReason')}
                                required
                                placeholder="Please provide a detailed reason for exceeding the KM limit..."
                                helperText="Required when KM exceeds the site limit"
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#ff9800' },
                                    '&.Mui-focused fieldset': { borderColor: '#ff9800' }
                                  }
                                }}
                              />
                            </Grid>
                          )}
                        </>
                      )}
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Date"
                          type="date"
                          value={formData.date}
                          onChange={handleInputChange('date')}
                          required
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Vendor/Supplier"
                          value={formData.vendor}
                          onChange={handleInputChange('vendor')}
                          required
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <Select
                            value={formData.paymentMethod || ''}
                            onChange={handleInputChange('paymentMethod')}
                            required
                            displayEmpty
                            renderValue={(selected) => {
                              if (!selected) {
                                return <em style={{ color: darkMode ? 'rgba(255, 255, 255, 0.38)' : 'rgba(0, 0, 0, 0.38)' }}>Payment Method</em>;
                              }
                              return selected;
                            }}
                            sx={{
                              backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                              color: darkMode ? '#e0e0e0' : '#333333',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: darkMode ? '#333333' : '#e0e0e0',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: darkMode ? '#4fc3f7' : '#667eea',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: darkMode ? '#4fc3f7' : '#667eea',
                              },
                              '& .MuiSelect-icon': {
                                color: darkMode ? '#b0b0b0' : '#666666',
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  bgcolor: darkMode ? '#2a2a2a' : '#ffffff',
                                  '& .MuiMenuItem-root': {
                                    color: darkMode ? '#e0e0e0' : '#333333',
                                    '&:hover': {
                                      bgcolor: darkMode ? '#333333' : '#f5f5f5',
                                    },
                                  },
                                },
                              },
                            }}
                          >
                            <MenuItem value="" disabled>
                              <em>Payment Method</em>
                            </MenuItem>
                            {paymentMethods.map((method) => (
                              <MenuItem key={method} value={method}>{method}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <Select
                            value={formData.priority || ''}
                            onChange={handleInputChange('priority')}
                            displayEmpty
                            renderValue={(selected) => {
                              if (!selected) {
                                return <em style={{ color: darkMode ? 'rgba(255, 255, 255, 0.38)' : 'rgba(0, 0, 0, 0.38)' }}>Priority</em>;
                              }
                              return selected;
                            }}
                            sx={{
                              backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                              color: darkMode ? '#e0e0e0' : '#333333',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: darkMode ? '#333333' : '#e0e0e0',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: darkMode ? '#4fc3f7' : '#667eea',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: darkMode ? '#4fc3f7' : '#667eea',
                              },
                              '& .MuiSelect-icon': {
                                color: darkMode ? '#b0b0b0' : '#666666',
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  bgcolor: darkMode ? '#2a2a2a' : '#ffffff',
                                  '& .MuiMenuItem-root': {
                                    color: darkMode ? '#e0e0e0' : '#333333',
                                    '&:hover': {
                                      bgcolor: darkMode ? '#333333' : '#f5f5f5',
                                    },
                                  },
                                },
                              },
                            }}
                          >
                            <MenuItem value="" disabled>
                              <em>Priority</em>
                            </MenuItem>
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="normal">Normal</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="urgent">Urgent</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          multiline
                          rows={4}
                          value={formData.description}
                          onChange={handleInputChange('description')}
                          required
                          placeholder="Provide detailed description of the expense..."
                        />
                      </Grid>
                      
                      {/* Bank Details Section */}
                      <Grid item xs={12}>
                        <Typography variant="h6" color="primary" gutterBottom>
                          Bank Details
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Account Number"
                          name="accountNumber"
                          value={formData.bankDetails.accountNumber}
                          onChange={e => setFormData(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, accountNumber: e.target.value } }))}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="IFSC Code"
                          name="ifscCode"
                          value={formData.bankDetails.ifscCode}
                          onChange={e => setFormData(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, ifscCode: e.target.value } }))}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Bank Name"
                          name="bankName"
                          value={formData.bankDetails.bankName}
                          onChange={e => setFormData(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, bankName: e.target.value } }))}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Account Holder Name"
                          name="accountHolderName"
                          value={formData.bankDetails.accountHolderName}
                          onChange={e => setFormData(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, accountHolderName: e.target.value } }))}
                          required
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                          <Button
                            variant="outlined"
                            startIcon={<SaveIcon />}
                            sx={{ px: 4 }}
                          >
                            Save Draft
                          </Button>
                          <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SendIcon />}
                            sx={{ 
                              px: 4,
                              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                              '&:hover': { background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)' }
                            }}
                            disabled={loading}
                          >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit for Approval'}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </form>
                </Paper>
              </Zoom>
            </Grid>

            {/* File Upload & Preview */}
            <Grid item xs={12} md={4}>
              <Zoom in style={{ transitionDelay: '400ms' }}>
                <Paper elevation={16} sx={{ 
                  p: 4, 
                  borderRadius: 3, 
                  background: darkMode ? 'rgba(26,26,26,0.95)' : 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: darkMode ? '1px solid rgba(51,51,51,0.3)' : '1px solid rgba(255,255,255,0.2)',
                  height: 'fit-content'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: '#667eea', mr: 2 }}>
                      <CloudUploadIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600} color="#667eea">
                      Attachments
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<AttachFileIcon />}
                        sx={{ flex: 1 }}
                      >
                        Upload Files
                        <input
                          type="file"
                          multiple
                          hidden
                          onChange={handleFileUpload}
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<CameraAltIcon />}
                        onClick={openCamera}
                        sx={{ 
                          flex: 1,
                          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                          '&:hover': { background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)' }
                        }}
                      >
                        Take Photo
                      </Button>
                    </Box>
                    <Typography variant="caption" sx={{ color: darkMode ? '#b0b0b0' : '#666666' }}>
                      Upload files or take photos of receipts, invoices, and documents
                    </Typography>
                  </Box>
                  
                  {attachments.length > 0 && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" fontWeight={600} gutterBottom>
                          Uploaded Files ({attachments.length})
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={handleViewAttachments}
                          sx={{ 
                            color: '#667eea', 
                            borderColor: '#667eea',
                            '&:hover': { 
                              borderColor: '#5a6fd8',
                              backgroundColor: 'rgba(102, 126, 234, 0.04)'
                            }
                          }}
                        >
                          View All
                        </Button>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {attachments.map((file) => (
                          <Card key={file.id} sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {file.source === 'camera' ? (
                                <PhotoCameraIcon sx={{ color: '#667eea' }} />
                              ) : (
                                <AttachFileIcon sx={{ color: '#667eea' }} />
                              )}
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" fontWeight={500}>
                                  {file.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: darkMode ? '#b0b0b0' : '#666666' }}>
                                  {file.source === 'camera' ? 'Camera Photo' : 'Uploaded File'} • {(file.size / 1024 / 1024).toFixed(2)} MB
                                </Typography>
                              </Box>
                              <Button
                                size="small"
                                onClick={() => handleRemoveFile(file.id)}
                                sx={{ color: '#f44336', minWidth: 'auto' }}
                              >
                                <DeleteIcon />
                              </Button>
                            </Box>
                          </Card>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Zoom>
            </Grid>
          </Grid>
        </Box>
      </Fade>

      {/* Camera Dialog */}
      <Dialog 
        open={cameraOpen} 
        onClose={closeCamera} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <CameraAltIcon />
          Take Photo
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ position: 'relative', width: '100%', height: 400 }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <canvas
              ref={canvasRef}
              style={{ display: 'none' }}
            />
            {/* Camera Controls Overlay */}
            <Box sx={{
              position: 'absolute',
              bottom: 20,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: 2
            }}>
              <Button
                variant="contained"
                color="error"
                onClick={closeCamera}
                sx={{ 
                  borderRadius: '50%',
                  width: 60,
                  height: 60,
                  minWidth: 'auto'
                }}
              >
                ✕
              </Button>
              <Button
                variant="contained"
                onClick={capturePhoto}
                sx={{ 
                  borderRadius: '50%',
                  width: 80,
                  height: 80,
                  minWidth: 'auto',
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  '&:hover': { background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)' }
                }}
              >
                <PhotoCameraIcon sx={{ fontSize: 32 }} />
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={closeCamera}
                sx={{ 
                  borderRadius: '50%',
                  width: 60,
                  height: 60,
                  minWidth: 'auto'
                }}
              >
                ✓
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Position your receipt or document in the camera view and click the camera button to capture
          </Typography>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          elevation={6} 
          variant="filled" 
          severity="success"
          sx={{ 
            width: '100%',
            fontSize: '1.1rem',
            '& .MuiAlert-icon': {
              fontSize: '2rem'
            }
          }}
        >
          ✅ Expense Report Submitted Successfully!
          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
            Redirecting to dashboard...
          </Typography>
        </Alert>
      </Snackbar>

      {/* Attachment Viewer Dialog */}
      <Dialog
        open={viewAttachments}
        onClose={() => setViewAttachments(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          bgcolor: 'primary.main',
          color: 'white'
        }}>
          <Typography variant="h6">
            Uploaded Attachments
          </Typography>
          <Button onClick={() => setViewAttachments(false)} sx={{ color: 'white' }}>
            ✕
          </Button>
        </DialogTitle>
                 <DialogContent sx={{ flexGrow: 1, p: 0 }}>
           <AttachmentViewer 
             attachments={attachments}
             onClose={() => setViewAttachments(false)}
             expenseId={null} // No expenseId for preview before submission
           />
         </DialogContent>
      </Dialog>

      {/* Show error alert if there's an error */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            position: 'fixed', 
            top: 16, 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: 9999,
            minWidth: '300px'
          }}
        >
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ExpenseForm; 