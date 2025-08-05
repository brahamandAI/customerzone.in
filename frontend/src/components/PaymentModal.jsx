import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import { paymentAPI } from '../services/api';

const PaymentModal = ({ open, onClose, expense, onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (open && expense) {
      createOrder();
    }
  }, [open, expense]);

  const createOrder = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Full expense object:', expense);
      console.log('🔍 Expense ID:', expense?._id);
      console.log('🔍 Expense amount:', expense?.amount);
      console.log('🔍 Expense type:', typeof expense?.amount);
      
      // Validate expense data
      if (!expense?.id && !expense?._id) {
        throw new Error('Expense ID is missing');
      }
      
      if (!expense?.amount || expense.amount <= 0) {
        throw new Error('Invalid expense amount');
      }

      const requestData = {
        expenseId: expense.id || expense._id, // Use id from transformed object
        amount: Number(expense.amount),
        currency: 'INR'
      };

      console.log('📤 Sending request data:', requestData);

      const response = await paymentAPI.createOrder(requestData);

      console.log('✅ Order created successfully:', response.data);
      setOrder(response.data.order);
    } catch (error) {
      console.error('Error creating order:', error);
      
      // Show detailed error message
      let errorMessage = 'Failed to create payment order. Please try again.';
      
      if (error.response) {
        console.log('Error response:', error.response);
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        }
        if (error.response.status === 403) {
          errorMessage = 'You are not authorized to make this payment.';
        }
        if (error.response.status === 404) {
          errorMessage = 'Expense not found.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (!order) return;

    const options = {
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: 'Rakshak Expense Management',
      description: `Payment for ${expense.title}`,
      order_id: order.id,
      handler: async (response) => {
        try {
          setLoading(true);
          
          const verifyResponse = await paymentAPI.verifyPayment({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            expenseId: expense.id || expense._id
          });

          if (verifyResponse.data.success) {
            onPaymentSuccess(verifyResponse.data.payment);
            onClose();
          }
        } catch (error) {
          console.error('Payment verification failed:', error);
          setError('Payment verification failed. Please contact support.');
        } finally {
          setLoading(false);
        }
      },
      prefill: {
        name: expense.submittedBy?.name || '',
        email: expense.submittedBy?.email || '',
      },
      theme: {
        color: '#008080'
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight={600}>
          Process Payment
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Complete payment for expense: {expense?.expenseNumber}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && !order ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {/* Expense Details */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Expense Details
              </Typography>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'rgba(0,128,128,0.05)', 
                borderRadius: 2,
                border: '1px solid rgba(0,128,128,0.1)'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Expense Number:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {expense?.expenseNumber}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Title:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {expense?.title}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Category:
                  </Typography>
                  <Chip 
                    label={expense?.category} 
                    size="small" 
                    sx={{ bgcolor: 'rgba(0,128,128,0.1)', color: '#008080' }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Submitted By:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {expense?.submittedBy?.name}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Payment Amount */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Payment Amount
              </Typography>
              <Box sx={{ 
                p: 3, 
                bgcolor: 'rgba(76, 175, 80, 0.05)', 
                borderRadius: 2,
                border: '1px solid rgba(76, 175, 80, 0.2)',
                textAlign: 'center'
              }}>
                <Typography variant="h4" fontWeight={700} color="#4caf50">
                  ₹{expense?.amount?.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Amount to be processed
                </Typography>
              </Box>
            </Box>

            {/* Payment Method */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Payment Method
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Payment will be processed securely through Razorpay. You can pay using:
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip label="Credit/Debit Cards" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label="Net Banking" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label="UPI" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label="Digital Wallets" size="small" sx={{ mr: 1, mb: 1 }} />
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          sx={{ color: 'text.secondary' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handlePayment}
          variant="contained"
          disabled={loading || !order}
          sx={{
            background: 'linear-gradient(45deg, #008080 30%, #20B2AA 90%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #006666 30%, #008080 90%)'
            }
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
              Processing...
            </>
          ) : (
            'Proceed to Payment'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal; 