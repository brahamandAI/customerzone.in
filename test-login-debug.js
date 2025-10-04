const axios = require('axios');

async function testLoginDebug() {
  console.log('🔍 Debugging Login Issue...\n');
  
  const baseURL = 'http://localhost:5001/api';
  
  try {
    // 1. Check server status
    console.log('1️⃣ Checking server status...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Server is running');
    console.log(`📊 Uptime: ${Math.round(healthResponse.data.uptime)} seconds`);
    console.log('');
    
    // 2. Try different login credentials
    console.log('2️⃣ Trying different login credentials...');
    
    const credentials = [
      { email: 'admin@rakshaksecuritas.com', password: 'Rakshak@123' },
      { email: 'admin@rakshaksecuritas.com', password: 'rakshak123' },
      { email: 'admin@rakshaksecuritas.com', password: 'Rakshak123' },
      { email: 'admin@rakshaksecuritas.com', password: 'admin123' },
      { email: 'admin@rakshaksecuritas.com', password: 'Admin123' }
    ];
    
    for (let i = 0; i < credentials.length; i++) {
      const cred = credentials[i];
      console.log(`   Trying ${i + 1}: ${cred.email} / ${cred.password}`);
      
      try {
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
          email: cred.email,
          password: cred.password
        });
        
        console.log(`   ✅ SUCCESS! Login successful with password: ${cred.password}`);
        console.log(`   👤 User: ${loginResponse.data.user.name}`);
        console.log(`   🎭 Role: ${loginResponse.data.user.role}`);
        console.log(`   🏢 Site: ${loginResponse.data.user.site?.name || 'No Site'}`);
        console.log(`   🔑 Token: ${loginResponse.data.token.substring(0, 20)}...`);
        
        // Test dashboard access
        console.log('\n3️⃣ Testing dashboard access...');
        const dashboardResponse = await axios.get(`${baseURL}/dashboard/overview`, {
          headers: {
            'Authorization': `Bearer ${loginResponse.data.token}`
          }
        });
        
        console.log('✅ Dashboard access successful!');
        console.log('📊 Dashboard data keys:', Object.keys(dashboardResponse.data.data));
        
        return; // Exit on success
        
      } catch (error) {
        if (error.response) {
          console.log(`   ❌ Failed: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
        } else {
          console.log(`   ❌ Failed: ${error.message}`);
        }
      }
      
      // Wait 1 second between attempts
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n❌ All login attempts failed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLoginDebug();
