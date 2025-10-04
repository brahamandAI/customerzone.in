const axios = require('axios');

async function testServerStatus() {
  console.log('🧪 Testing Server Status...\n');
  
  const baseURL = 'http://localhost:5001/api';
  
  try {
    // Test if server is running
    console.log('1️⃣ Testing server connection...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Server is running');
    console.log('Response:', healthResponse.data);
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Please start the backend server first.');
      console.log('Run: cd backend && npm run dev');
      return;
    }
    console.log('⚠️  Server responded but health endpoint not found');
  }
  
  try {
    // Test login with different credentials
    console.log('\n2️⃣ Testing login with different credentials...');
    
    const testCredentials = [
      { email: 'admin@rakshaksecuritas.com', password: 'Rakshak@123' },
      { email: 'admin@rakshaksecuritas.com', password: 'admin123' },
      { email: 'admin@rakshaksecuritas.com', password: 'password' },
      { email: 'admin@rakshaksecuritas.com', password: 'Admin@123' },
      { email: 'admin@rakshaksecuritas.com', password: 'Rakshak123' }
    ];
    
    for (const cred of testCredentials) {
      try {
        console.log(`   Trying: ${cred.email} / ${cred.password}`);
        const loginResponse = await axios.post(`${baseURL}/auth/login`, cred);
        console.log(`   ✅ SUCCESS: Logged in as ${loginResponse.data.user.name} (${loginResponse.data.user.role})`);
        console.log(`   📍 Site: ${loginResponse.data.user.site?.name || 'No Site'}`);
        break;
      } catch (loginError) {
        console.log(`   ❌ Failed: ${loginError.response?.data?.message || 'Invalid credentials'}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Login test failed:', error.message);
  }
}

testServerStatus();
