const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:5001/api';

console.log('🧪 Simple Site Deletion Test\n');

// Test 1: Check if server is running
async function testServerStatus() {
  console.log('1️⃣ Testing server status...');
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Server is running');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Server not responding or health endpoint not available');
    console.log('Error:', error.message);
  }
}

// Test 2: Check sites endpoint (should work without auth)
async function testSitesEndpoint() {
  console.log('\n2️⃣ Testing sites endpoint...');
  try {
    const response = await axios.get(`${API_BASE_URL}/sites/all`);
    console.log('✅ Sites endpoint working');
    console.log('Sites found:', response.data.data?.length || 0);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('Sample site:', {
        id: response.data.data[0]._id,
        name: response.data.data[0].name,
        code: response.data.data[0].code,
        isActive: response.data.data[0].isActive
      });
    }
  } catch (error) {
    console.log('❌ Sites endpoint error:', error.response?.data || error.message);
  }
}

// Test 3: Test delete endpoint without auth (should fail)
async function testDeleteWithoutAuth() {
  console.log('\n3️⃣ Testing delete endpoint without authentication...');
  try {
    const fakeSiteId = '507f1f77bcf86cd799439011';
    const response = await axios.delete(`${API_BASE_URL}/sites/${fakeSiteId}`);
    console.log('❌ Delete should have failed without auth');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Delete endpoint properly protected (401 Unauthorized)');
    } else if (error.response?.status === 404) {
      console.log('✅ Delete endpoint working (404 Not Found - expected for fake ID)');
    } else {
      console.log('⚠️ Unexpected error:', error.response?.status, error.response?.data);
    }
  }
}

// Test 4: Check if backend server is actually running
async function testBackendConnection() {
  console.log('\n4️⃣ Testing backend connection...');
  try {
    const response = await axios.get('http://localhost:5001');
    console.log('✅ Backend server responding on port 5001');
  } catch (error) {
    console.log('❌ Backend server not responding on port 5001');
    console.log('Make sure to run: cd backend && npm start');
  }
}

// Run all tests
async function runTests() {
  await testBackendConnection();
  await testServerStatus();
  await testSitesEndpoint();
  await testDeleteWithoutAuth();
  
  console.log('\n🎉 Simple tests completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Make sure backend server is running: cd backend && npm start');
  console.log('2. Use frontend to test site deletion with proper authentication');
  console.log('3. Check browser console for detailed logs');
}

runTests().catch(console.error);
