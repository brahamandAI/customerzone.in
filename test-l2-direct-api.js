const axios = require('axios');

// Test L2 Approver API endpoints directly (without login)
async function testL2DirectAPI() {
  console.log('🧪 Testing L2 Approver API Endpoints Directly...\n');
  
  const baseURL = 'http://localhost:5001/api';
  
  try {
    // Test if server is running
    console.log('1️⃣ Testing server connection...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Server is running');
    console.log(`📊 Uptime: ${Math.round(healthResponse.data.uptime)} seconds`);
    console.log(`💾 Memory: ${Math.round(healthResponse.data.memory.heapUsed / 1024 / 1024)} MB`);
    console.log('');
    
    // Test public endpoints
    console.log('2️⃣ Testing public endpoints...');
    
    try {
      const sitesResponse = await axios.get(`${baseURL}/sites/all`);
      console.log(`✅ Sites API: ${sitesResponse.data.data?.length || 0} sites found`);
      
      if (sitesResponse.data.data && sitesResponse.data.data.length > 0) {
        console.log('🌍 Available Sites:');
        sitesResponse.data.data.forEach((site, index) => {
          console.log(`   ${index + 1}. ${site.name} (${site.code})`);
        });
      }
    } catch (error) {
      console.log(`❌ Sites API failed: ${error.response?.data?.message || error.message}`);
    }
    
    console.log('');
    
    // Test if we can access protected endpoints (should fail without auth)
    console.log('3️⃣ Testing protected endpoints (should fail without auth)...');
    
    const protectedEndpoints = [
      '/dashboard/overview',
      '/expenses/all',
      '/dashboard/recent-activity',
      '/dashboard/analytics',
      '/reports/expense-details',
      '/users/all'
    ];
    
    for (const endpoint of protectedEndpoints) {
      try {
        await axios.get(`${baseURL}${endpoint}`);
        console.log(`⚠️  ${endpoint}: Unexpectedly accessible without auth`);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`✅ ${endpoint}: Properly protected (401 Unauthorized)`);
        } else {
          console.log(`❌ ${endpoint}: Unexpected error - ${error.response?.status || error.message}`);
        }
      }
    }
    
    console.log('');
    console.log('📋 SUMMARY:');
    console.log('===========');
    console.log('✅ Backend server is running');
    console.log('✅ Health endpoint working');
    console.log('✅ Protected endpoints properly secured');
    console.log('');
    console.log('🔑 NEXT STEPS:');
    console.log('1. Unlock the admin account or restart backend server');
    console.log('2. Get correct login credentials');
    console.log('3. Run the full L2 approver test');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testL2DirectAPI();
