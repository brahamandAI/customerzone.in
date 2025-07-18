const axios = require('axios');

const testSubmitFlow = async () => {
  console.log('🧪 Testing Expense Submit Flow...\n');
  
  const baseURL = 'http://localhost:5001/api';
  
  try {
    // Test 1: Backend Health
    console.log('1. Testing Backend Health...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Backend is healthy:', healthResponse.data.status);
    
    // Test 2: Auth Endpoint
    console.log('\n2. Testing Auth Endpoint...');
    const authResponse = await axios.get(`${baseURL}/auth`);
    console.log('✅ Auth endpoint accessible');
    
    // Test 3: Expenses Endpoint
    console.log('\n3. Testing Expenses Endpoint...');
    const expensesResponse = await axios.get(`${baseURL}/expenses`);
    console.log('✅ Expenses endpoint accessible');
    
    // Test 4: Test Expense Creation
    console.log('\n4. Testing Expense Creation...');
    const testExpense = {
      amount: 500,
      category: 'Fuel',
      description: 'Test expense for fuel',
      expenseDate: new Date().toISOString(),
      site: 'test-site-id',
      submittedBy: 'test-user-id'
    };
    
    const createResponse = await axios.post(`${baseURL}/expenses`, testExpense);
    console.log('✅ Expense creation successful:', createResponse.data.success);
    
    console.log('\n🎉 All API Tests Passed!');
    console.log('\n📋 Frontend Testing:');
    console.log('1. Go to: http://localhost:3000');
    console.log('2. Login with any test user');
    console.log('3. Click "Submit Expense"');
    console.log('4. Fill form and submit');
    console.log('5. Check if it appears in approval page');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
    
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure backend is running on port 5001');
    console.log('2. Check if MongoDB is connected');
    console.log('3. Verify all routes are properly registered');
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  testSubmitFlow();
}

module.exports = testSubmitFlow; 