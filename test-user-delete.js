const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:5001/api';
const TEST_USER_EMAIL = 'admin@test.com'; // Replace with actual admin email
const TEST_USER_PASSWORD = 'admin123'; // Replace with actual admin password

async function testUserDelete() {
  try {
    console.log('🧪 Testing User Delete Functionality...\n');

    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 2: Get all users
    console.log('\n2️⃣ Fetching all users...');
    const usersResponse = await axios.get(`${API_BASE_URL}/users/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const users = usersResponse.data.data;
    console.log(`✅ Found ${users.length} users`);

    if (users.length === 0) {
      console.log('❌ No users found to test deletion');
      return;
    }

    // Step 3: Find a test user to delete (not the current admin)
    const testUser = users.find(user => user.email !== TEST_USER_EMAIL);
    
    if (!testUser) {
      console.log('❌ No test user found (all users are admin)');
      return;
    }

    console.log(`\n3️⃣ Testing deletion of user: ${testUser.email} (ID: ${testUser._id})`);

    // Step 4: Attempt to delete the user
    console.log('4️⃣ Attempting to delete user...');
    const deleteResponse = await axios.delete(`${API_BASE_URL}/users/${testUser._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Delete request successful');
    console.log('Response:', deleteResponse.data);

    // Step 5: Verify user is no longer in the list
    console.log('\n5️⃣ Verifying user is deleted...');
    const updatedUsersResponse = await axios.get(`${API_BASE_URL}/users/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const updatedUsers = updatedUsersResponse.data.data;
    const deletedUser = updatedUsers.find(user => user._id === testUser._id);

    if (!deletedUser) {
      console.log('✅ User successfully deleted from the list');
    } else {
      console.log('❌ User still appears in the list');
    }

    console.log('\n🎉 User delete functionality test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Make sure you have the correct admin credentials');
    } else if (error.response?.status === 403) {
      console.log('💡 Make sure the user has admin privileges');
    } else if (error.response?.status === 404) {
      console.log('💡 User not found - check the user ID');
    }
  }
}

// Run the test
testUserDelete(); 