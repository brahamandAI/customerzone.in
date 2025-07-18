import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, Grid, CircularProgress, Alert } from '@mui/material';
import { userAPI } from '../services/api';

const EditUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    employeeId: '',
    department: '',
    role: '',
    site: '',
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const res = await userAPI.getUser(userId);
        const user = res.data.data;
        setFormData({
          fullName: user.name || '',
          email: user.email || '',
          phoneNumber: user.phone || '',
          employeeId: user.employeeId || '',
          department: user.department || '',
          role: user.role || '',
          site: user.site?.code || '',
          streetAddress: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          pinCode: user.address?.zipCode || '',
          bankAccountNumber: user.bankDetails?.accountNumber || '',
          bankIfscCode: user.bankDetails?.ifscCode || '',
          bankName: user.bankDetails?.bankName || '',
          bankAccountHolderName: user.bankDetails?.accountHolderName || ''
        });
      } catch (err) {
        setError('Failed to fetch user');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await userAPI.updateUser(userId, {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phoneNumber,
        employeeId: formData.employeeId,
        department: formData.department,
        role: formData.role,
        site: formData.site,
        address: {
          street: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          zipCode: formData.pinCode
        },
        bankDetails: {
          accountNumber: formData.bankAccountNumber,
          ifscCode: formData.bankIfscCode,
          bankName: formData.bankName,
          accountHolderName: formData.bankAccountHolderName
        }
      });
      navigate('/manage-users');
    } catch (err) {
      setError('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>
          Edit User
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Employee ID"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Site Code"
              name="site"
              value={formData.site}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Street Address"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="PIN Code"
              name="pinCode"
              value={formData.pinCode}
              onChange={handleChange}
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
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={saving}
          sx={{ mt: 3 }}
        >
          {saving ? 'Saving...' : 'Update User'}
        </Button>
      </Paper>
    </Box>
  );
};

export default EditUser; 