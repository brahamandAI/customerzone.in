const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:5001/api';
const TEST_SITE_NAME = 'Test Site for Deletion';
const TEST_SITE_CODE = 'TEST_DELETE_001';

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

// Test functions
async function testSiteDeletion() {
  console.log('🧪 Testing Site Deletion Functionality\n');
  
  // Step 1: Create a test site
  console.log('1️⃣ Creating test site...');
  const createSiteData = {
    name: TEST_SITE_NAME,
    code: TEST_SITE_CODE,
    location: {
      address: 'Test Address',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      country: 'India'
    },
    budget: {
      monthly: 50000,
      yearly: 600000
    },
    createdBy: 'test-user'
  };
  
  const createResult = await makeRequest('POST', '/sites/create', createSiteData);
  
  if (!createResult.success) {
    console.log('❌ Failed to create test site:', createResult.error);
    return;
  }
  
  const siteId = createResult.data.data._id;
  console.log('✅ Test site created with ID:', siteId);
  
  // Step 2: Verify site exists
  console.log('\n2️⃣ Verifying site exists...');
  const getResult = await makeRequest('GET', `/sites/${siteId}`);
  
  if (!getResult.success) {
    console.log('❌ Failed to get test site:', getResult.error);
    return;
  }
  
  console.log('✅ Site found:', getResult.data.data.name);
  
  // Step 3: Try to delete site
  console.log('\n3️⃣ Attempting to delete site...');
  const deleteResult = await makeRequest('DELETE', `/sites/${siteId}`);
  
  if (!deleteResult.success) {
    console.log('❌ Failed to delete site:', deleteResult.error);
    console.log('Status:', deleteResult.status);
    return;
  }
  
  console.log('✅ Site deleted successfully:', deleteResult.data.message);
  
  // Step 4: Verify site is no longer in active list
  console.log('\n4️⃣ Verifying site is removed from active list...');
  const getAllResult = await makeRequest('GET', '/sites/all');
  
  if (!getAllResult.success) {
    console.log('❌ Failed to get sites list:', getAllResult.error);
    return;
  }
  
  const deletedSite = getAllResult.data.data.find(site => site._id === siteId);
  
  if (deletedSite) {
    console.log('❌ Site still appears in active list');
    console.log('Site status:', deletedSite.isActive);
  } else {
    console.log('✅ Site successfully removed from active list');
  }
  
  // Step 5: Try to get deleted site directly
  console.log('\n5️⃣ Attempting to get deleted site directly...');
  const getDeletedResult = await makeRequest('GET', `/sites/${siteId}`);
  
  if (!getDeletedResult.success) {
    console.log('✅ Deleted site not found (as expected)');
  } else {
    console.log('⚠️ Deleted site still accessible (soft delete)');
    console.log('Site status:', getDeletedResult.data.data.isActive);
  }
  
  console.log('\n🎉 Site deletion test completed!');
}

// Run the test
testSiteDeletion().catch(console.error);
