import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Switch,
  FormControlLabel,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  FormHelperText
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { siteAPI } from '../services/api';

const CreateUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    employeeId: '',
    department: 'Finance',
    role: 'SUBMITTER',
    site: '', // Changed from assignedSites to site for single site selection
    initialPassword: '',
    confirmPassword: '',
    // Notification preferences
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    // Permissions
    canCreateExpenses: true,
    canApproveExpenses: false,
    canManageUsers: false,
    canManageSites: false,
    canViewReports: false,
    canManageBudgets: false,
    // Address
    streetAddress: '',
    city: '',
    state: '',
    pinCode: '',
    // Bank Details
    bankAccountNumber: '',
    bankIfscCode: '',
    bankName: '',
    bankAccountHolderName: ''
  });

  const departments = ['Finance', 'Operations', 'HR', 'IT', 'Sales', 'Marketing'];
  const roles = ['SUBMITTER', 'L1_APPROVER', 'L2_APPROVER', 'L3_APPROVER', 'L4_APPROVER'];
  const [sites, setSites] = useState([]);

  useEffect(() => {
    siteAPI.getAll().then(res => {
      setSites(res.data.data || []);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If this is a site selection, store the site code in localStorage
    if (name === 'site') {
      localStorage.setItem('selectedSiteCode', value);
    }
    
    // If role is being changed, set appropriate permissions
    if (name === 'role') {
      let newPermissions = {
        canCreateExpenses: false,
        canApproveExpenses: false,
        canManageUsers: false,
        canManageSites: false,
        canViewReports: false,
        canManageBudgets: false
      };
      
      if (value === 'L4_APPROVER') {
        // L4 Approver: admin functionality without expense creation/approval
        newPermissions = {
          canCreateExpenses: false,
          canApproveExpenses: false,
          canManageUsers: true,
          canManageSites: true,
          canViewReports: true,
          canManageBudgets: true
        };
      } else if (value === 'L3_APPROVER') {
        // L3 Approver: full permissions
        newPermissions = {
          canCreateExpenses: true,
          canApproveExpenses: true,
          canManageUsers: true,
          canManageSites: true,
          canViewReports: true,
          canManageBudgets: true
        };
      } else if (value === 'L2_APPROVER') {
        // L2 Approver: some admin permissions
        newPermissions = {
          canCreateExpenses: true,
          canApproveExpenses: true,
          canManageUsers: false,
          canManageSites: false,
          canViewReports: true,
          canManageBudgets: false
        };
      } else if (value === 'L1_APPROVER') {
        // L1 Approver: basic approval permissions
        newPermissions = {
          canCreateExpenses: true,
          canApproveExpenses: true,
          canManageUsers: false,
          canManageSites: false,
          canViewReports: true,
          canManageBudgets: false
        };
      } else if (value === 'SUBMITTER') {
        // Submitter: only create expenses
        newPermissions = {
          canCreateExpenses: true,
          canApproveExpenses: false,
          canManageUsers: false,
          canManageSites: false,
          canViewReports: false,
          canManageBudgets: false
        };
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        ...newPermissions
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSwitchChange = (name) => (event) => {
    setFormData(prev => ({
      ...prev,
      [name]: event.target.checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get the site code from localStorage if available
      const siteCode = localStorage.getItem('selectedSiteCode') || formData.site;
      
      const userData = {
        ...formData,
        site: siteCode, // Send the site code to backend
        bankAccountNumber: formData.bankAccountNumber,
        bankIfscCode: formData.bankIfscCode,
        bankName: formData.bankName,
        bankAccountHolderName: formData.bankAccountHolderName
      };

      const response = await userAPI.createUser(userData);
      if (response.data.success) {
        // Clear the stored site code after successful creation
        localStorage.removeItem('selectedSiteCode');
        navigate('/dashboard');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        {/* Basic Information Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>👤</Avatar>
            Basic Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Employee ID"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                helperText="Format: RSI-YYYY-NNN (e.g., RSI-2024-001)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  {roles.map(role => (
                    <MenuItem key={role} value={role}>
                      {role.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Site</InputLabel>
                <Select
                  name="site"
                  value={formData.site}
                  onChange={handleChange}
                  required
                >
                  {sites.map(site => (
                    <MenuItem key={site._id} value={site.code}>
                      {site.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Initial Password"
                name="initialPassword"
                type="password"
                value={formData.initialPassword}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>

          {/* Notification Preferences */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Notification Preferences
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.emailNotifications}
                      onChange={handleSwitchChange('emailNotifications')}
                    />
                  }
                  label="Email Notifications"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.pushNotifications}
                      onChange={handleSwitchChange('pushNotifications')}
                    />
                  }
                  label="Push Notifications"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.smsNotifications}
                      onChange={handleSwitchChange('smsNotifications')}
                    />
                  }
                  label="SMS Notifications"
                />
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* User Permissions Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            User Permissions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.canCreateExpenses}
                    onChange={handleSwitchChange('canCreateExpenses')}
                  />
                }
                label="Can Create Expenses"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.canApproveExpenses}
                    onChange={handleSwitchChange('canApproveExpenses')}
                  />
                }
                label="Can Approve Expenses"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.canManageUsers}
                    onChange={handleSwitchChange('canManageUsers')}
                  />
                }
                label="Can Manage Users"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.canManageSites}
                    onChange={handleSwitchChange('canManageSites')}
                  />
                }
                label="Can Manage Sites"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.canViewReports}
                    onChange={handleSwitchChange('canViewReports')}
                  />
                }
                label="Can View Reports"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.canManageBudgets}
                    onChange={handleSwitchChange('canManageBudgets')}
                  />
                }
                label="Can Manage Budgets"
              />
            </Grid>
          </Grid>
        </Box>

        {/* Address Details Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Address Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="PIN Code"
                name="pinCode"
                value={formData.pinCode}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>
        </Box>

        {/* Bank Details Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Bank Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Account Number"
                name="bankAccountNumber"
                value={formData.bankAccountNumber}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="IFSC Code"
                name="bankIfscCode"
                value={formData.bankIfscCode}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Bank Name"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Account Holder Name"
                name="bankAccountHolderName"
                value={formData.bankAccountHolderName}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? 'Creating...' : 'Create User'}
        </Button>
      </Paper>
    </Box>
  );
};

export default CreateUser; 