const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:5001/api';
const TEST_USER_EMAIL = 'admin@test.com'; // Replace with actual admin email
const TEST_USER_PASSWORD = 'admin123'; // Replace with actual admin password

async function testBackendRoute() {
  try {
    console.log('🧪 Testing Backend DELETE Route...\n');

    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 2: Test the DELETE route directly
    const testUserId = '6868e7442396774193cd0a1e';
    console.log(`\n2️⃣ Testing DELETE route for user ID: ${testUserId}`);
    
    try {
      const deleteResponse = await axios.delete(`${API_BASE_URL}/users/${testUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ DELETE request successful');
      console.log('Response:', deleteResponse.data);
      
    } catch (deleteError) {
      console.log('❌ DELETE request failed');
      console.log('Status:', deleteError.response?.status);
      console.log('Error:', deleteError.response?.data || deleteError.message);
    }

    // Step 3: Test if the route exists by making a GET request to the same endpoint
    console.log(`\n3️⃣ Testing if route exists by making GET request...`);
    try {
      const getResponse = await axios.get(`${API_BASE_URL}/users/${testUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ GET request successful (route exists)');
      console.log('Response status:', getResponse.status);
      
    } catch (getError) {
      console.log('❌ GET request failed');
      console.log('Status:', getError.response?.status);
      console.log('Error:', getError.response?.data || getError.message);
    }

    // Step 4: Test the /users/all endpoint to see available users
    console.log(`\n4️⃣ Testing /users/all endpoint...`);
    try {
      const allUsersResponse = await axios.get(`${API_BASE_URL}/users/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ GET /users/all successful');
      console.log('Number of users:', allUsersResponse.data.data?.length || 0);
      
      if (allUsersResponse.data.data) {
        allUsersResponse.data.data.forEach((user, index) => {
          console.log(`${index + 1}. ${user.name} (${user.email}) - ID: ${user._id}`);
        });
      }
      
    } catch (allUsersError) {
      console.log('❌ GET /users/all failed');
      console.log('Status:', allUsersError.response?.status);
      console.log('Error:', allUsersError.response?.data || allUsersError.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Make sure you have the correct admin credentials');
    } else if (error.response?.status === 403) {
      console.log('💡 Make sure the user has admin privileges');
    } else if (error.response?.status === 404) {
      console.log('💡 Route not found - check if server is running');
    }
  }
}

// Run the test
testBackendRoute(); 