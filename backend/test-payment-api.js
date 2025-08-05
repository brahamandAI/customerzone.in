const axios = require('axios');
require('dotenv').config();

// Test payment API directly
async function testPaymentAPI() {
  console.log('🧪 Testing Payment API Directly');
  console.log('================================\n');

  try {
    // First, let's test if the server is running
    console.log('1️⃣ Testing server connection...');
    const healthCheck = await axios.get('http://localhost:5001/api/health');
    console.log('✅ Server is running');
    console.log('Response:', healthCheck.data);

    // Test with a mock expense ID
    console.log('\n2️⃣ Testing payment order creation...');
    
    const testData = {
      expenseId: '507f1f77bcf86cd799439011', // Mock MongoDB ObjectId
      amount: 5001,
      currency: 'INR'
    };

    console.log('Request data:', testData);

    const response = await axios.post('http://localhost:5001/api/payments/create-order', testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will fail auth, but we'll see the error
      }
    });

    console.log('✅ Payment order created successfully!');
    console.log('Response:', response.data);

  } catch (error) {
    console.log('❌ Error occurred:');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
      console.log('Headers:', error.response.headers);
    } else if (error.request) {
      console.log('Request error:', error.request);
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Run the test
testPaymentAPI(); 