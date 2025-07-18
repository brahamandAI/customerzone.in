const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function testAPIConnection() {
  console.log('🧪 Testing Frontend API Connections...\n');

  const tests = [
    {
      name: 'Health Check',
      url: `${API_BASE_URL}/health`,
      method: 'GET'
    },
    {
      name: 'Get Sites',
      url: `${API_BASE_URL}/sites/all`,
      method: 'GET'
    },
    {
      name: 'Get Users',
      url: `${API_BASE_URL}/users/all`,
      method: 'GET'
    },
    {
      name: 'Get Expenses',
      url: `${API_BASE_URL}/expenses/all`,
      method: 'GET'
    },
    {
      name: 'Get Dashboard Overview',
      url: `${API_BASE_URL}/dashboard/overview`,
      method: 'GET'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`📡 Testing: ${test.name}`);
      const response = await axios({
        method: test.method,
        url: test.url,
        timeout: 5000
      });
      
      console.log(`✅ ${test.name}: SUCCESS`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Data: ${response.data.success ? 'Success' : 'Error'}`);
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`   Records: ${response.data.data.length}`);
      }
      console.log('');
      
    } catch (error) {
      console.log(`❌ ${test.name}: FAILED`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Message: ${error.response.data?.message || 'Unknown error'}`);
      } else if (error.request) {
        console.log(`   Error: No response received (server not running?)`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
      console.log('');
    }
  }

  console.log('🎯 API Connection Test Complete!');
}

// Test authentication endpoints
async function testAuthEndpoints() {
  console.log('\n🔐 Testing Authentication Endpoints...\n');

  const authTests = [
    {
      name: 'Register User (should fail without data)',
      url: `${API_BASE_URL}/auth/register`,
      method: 'POST',
      data: {}
    },
    {
      name: 'Login (should fail without credentials)',
      url: `${API_BASE_URL}/auth/login`,
      method: 'POST',
      data: {}
    }
  ];

  for (const test of authTests) {
    try {
      console.log(`📡 Testing: ${test.name}`);
      const response = await axios({
        method: test.method,
        url: test.url,
        data: test.data,
        timeout: 5000
      });
      
      console.log(`✅ ${test.name}: SUCCESS (unexpected)`);
      console.log(`   Status: ${response.status}`);
      console.log('');
      
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`✅ ${test.name}: SUCCESS (expected validation error)`);
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Message: ${error.response.data?.message || 'Validation error'}`);
      } else {
        console.log(`❌ ${test.name}: FAILED`);
        console.log(`   Error: ${error.message}`);
      }
      console.log('');
    }
  }
}

// Test expense endpoints
async function testExpenseEndpoints() {
  console.log('\n💰 Testing Expense Endpoints...\n');

  const expenseTests = [
    {
      name: 'Get All Expenses',
      url: `${API_BASE_URL}/expenses/all`,
      method: 'GET'
    },
    {
      name: 'Get Pending Expenses',
      url: `${API_BASE_URL}/expenses/pending`,
      method: 'GET'
    },
    {
      name: 'File Upload Test',
      url: `${API_BASE_URL}/expenses/upload`,
      method: 'POST'
    }
  ];

  for (const test of expenseTests) {
    try {
      console.log(`📡 Testing: ${test.name}`);
      const response = await axios({
        method: test.method,
        url: test.url,
        timeout: 5000
      });
      
      console.log(`✅ ${test.name}: SUCCESS`);
      console.log(`   Status: ${response.status}`);
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`   Records: ${response.data.data.length}`);
      }
      console.log('');
      
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log(`✅ ${test.name}: SUCCESS (authentication required)`);
        console.log(`   Status: ${error.response.status}`);
      } else {
        console.log(`❌ ${test.name}: FAILED`);
        console.log(`   Error: ${error.message}`);
      }
      console.log('');
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Frontend API Tests...\n');
  
  await testAPIConnection();
  await testAuthEndpoints();
  await testExpenseEndpoints();
  
  console.log('🎉 All Frontend API Tests Complete!');
}

runAllTests().catch(console.error); 