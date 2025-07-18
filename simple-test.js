const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is working!' });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Test endpoint working!',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/expenses', (req, res) => {
  console.log('Received expense data:', req.body);
  res.json({
    success: true,
    message: 'Expense submitted successfully!',
    data: req.body,
    id: 'exp_' + Date.now()
  });
});

app.get('/api/expenses', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'exp_001',
        amount: 500,
        category: 'Fuel',
        description: 'Test expense',
        status: 'pending',
        submittedBy: 'test-user'
      }
    ]
  });
});

// Start server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Simple test server running on port ${PORT}`);
  console.log(`📱 Test URL: http://localhost:${PORT}/api/health`);
  console.log(`📝 Submit test: http://localhost:${PORT}/api/expenses`);
});

console.log('✅ Simple test server created!');
console.log('📋 Now you can test:');
console.log('1. Backend: http://localhost:5001/api/health');
console.log('2. Frontend: http://localhost:3000');
console.log('3. Submit expense from frontend'); 