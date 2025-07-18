const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Test endpoint working!',
    timestamp: new Date().toISOString()
  });
});

// Expenses endpoint
app.post('/api/expenses', (req, res) => {
  console.log('📝 Received expense submission:', req.body);
  
  // Validate required fields
  const { amount, category, description, vendor, paymentMethod } = req.body;
  
  if (!amount || !category || !description || !vendor || !paymentMethod) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  // Create expense object
  const expense = {
    id: 'exp_' + Date.now(),
    amount: parseFloat(amount),
    category,
    description,
    vendor,
    paymentMethod,
    status: 'pending',
    submittedBy: 'test-user',
    submittedAt: new Date().toISOString(),
    ...req.body
  };

  console.log('✅ Expense created:', expense);

  res.json({
    success: true,
    message: 'Expense submitted successfully!',
    data: expense
  });
});

// Get expenses
app.get('/api/expenses', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'exp_001',
        amount: 500,
        category: 'Fuel',
        description: 'Test expense',
        vendor: 'Test Vendor',
        paymentMethod: 'Cash',
        status: 'pending',
        submittedBy: 'test-user',
        submittedAt: new Date().toISOString()
      }
    ]
  });
});

// Start server
const PORT = 5001;

app.listen(PORT, () => {
  console.log('🚀 Working backend server started!');
  console.log(`📱 Server running on: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Submit expense: http://localhost:${PORT}/api/expenses`);
  console.log('✅ Ready to accept requests!');
});

// Handle errors
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
}); 