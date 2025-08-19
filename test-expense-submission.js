const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:5001/api';

// Test credentials (update these with actual credentials)
const TEST_USER_EMAIL = 'sumitgupta9875@gmail.com';
const TEST_USER_PASSWORD = 'password123';

console.log('🧪 Testing Expense Submission with Site Fix\n');

// Helper function to make API calls
async function makeRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status 
    };
  }
}

// Login function
async function login(email, password) {
  console.log('🔐 Logging in...');
  const loginResult = await makeRequest('POST', '/auth/login', {
    email,
    password
  });
  
  if (!loginResult.success) {
    console.log('❌ Login failed:', loginResult.error);
    return null;
  }
  
  console.log('✅ Login successful');
  console.log('User info:', {
    name: loginResult.data.user.name,
    role: loginResult.data.user.role,
    site: loginResult.data.user.site?.name || loginResult.data.user.site
  });
  return loginResult.data.token;
}

// Test expense submission
async function testExpenseSubmission() {
  console.log('\n📝 Testing Expense Submission\n');
  
  // Step 1: Login
  const token = await login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
  if (!token) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  // Step 2: Get user info to see their site
  console.log('\n1️⃣ Getting user info...');
  const userResult = await makeRequest('GET', '/auth/me', null, token);
  
  if (!userResult.success) {
    console.log('❌ Failed to get user info:', userResult.error);
    return;
  }
  
  const user = userResult.data.user;
  console.log('✅ User info retrieved');
  console.log('User site:', user.site?.name || user.site);
  console.log('User site ID:', user.site?._id || user.site);
  
  // Step 3: Get next expense number
  console.log('\n2️⃣ Getting next expense number...');
  const numberResult = await makeRequest('GET', '/expenses/next-number', null, token);
  
  if (!numberResult.success) {
    console.log('❌ Failed to get expense number:', numberResult.error);
    return;
  }
  
  const expenseNumber = numberResult.data.expenseNumber;
  console.log('✅ Expense number:', expenseNumber);
  
  // Step 4: Submit test expense
  console.log('\n3️⃣ Submitting test expense...');
  const expenseData = {
    expenseNumber: expenseNumber,
    title: 'Test Expense - Site Fix',
    description: 'Testing expense submission with site comparison fix',
    amount: 100,
    currency: 'INR',
    category: 'miscellaneous',
    expenseDate: new Date().toISOString(),
    submittedById: user._id,
    siteId: user.site?._id || user.site, // Use user's assigned site
    department: user.department || 'Operations'
  };
  
  console.log('📋 Expense data:', {
    expenseNumber: expenseData.expenseNumber,
    title: expenseData.title,
    amount: expenseData.amount,
    siteId: expenseData.siteId,
    userSite: user.site?._id || user.site
  });
  
  const submitResult = await makeRequest('POST', '/expenses/create', expenseData, token);
  
  if (!submitResult.success) {
    console.log('❌ Failed to submit expense:', submitResult.error);
    console.log('Status:', submitResult.status);
    return;
  }
  
  console.log('✅ Expense submitted successfully!');
  console.log('Expense ID:', submitResult.data.data._id);
  console.log('Status:', submitResult.data.data.status);
  
  // Step 5: Verify expense was created
  console.log('\n4️⃣ Verifying expense creation...');
  const verifyResult = await makeRequest('GET', `/expenses/${submitResult.data.data._id}`, null, token);
  
  if (!verifyResult.success) {
    console.log('❌ Failed to verify expense:', verifyResult.error);
    return;
  }
  
  console.log('✅ Expense verified');
  console.log('Expense details:', {
    id: verifyResult.data.data._id,
    title: verifyResult.data.data.title,
    site: verifyResult.data.data.site,
    status: verifyResult.data.data.status
  });
  
  console.log('\n🎉 Expense submission test completed successfully!');
  console.log('✅ Site comparison fix is working correctly!');
}

// Run the test
testExpenseSubmission().catch(error => {
  console.error('❌ Test failed with error:', error.message);
});
