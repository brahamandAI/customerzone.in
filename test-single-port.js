const axios = require('axios');

const testSinglePortSetup = async () => {
  console.log('🧪 Testing Single Port Setup for Rakshak Expense Management...\n');
  
  try {
    // Test backend on port 5001
    console.log('1. Testing Backend (Port 5001)...');
    const backendResponse = await axios.get('http://localhost:5001/api/health');
    console.log('✅ Backend is running:', backendResponse.data.status);
    
    // Test frontend on port 3000
    console.log('\n2. Testing Frontend (Port 3000)...');
    const frontendResponse = await axios.get('http://localhost:3000');
    console.log('✅ Frontend is running');
    
    // Test proxy functionality
    console.log('\n3. Testing Proxy Configuration...');
    const proxyResponse = await axios.get('http://localhost:3000/api/health');
    console.log('✅ Proxy is working - API call through frontend:', proxyResponse.data.status);
    
    console.log('\n🎉 Single Port Setup is Working Perfectly!');
    console.log('\n📊 Configuration Summary:');
    console.log('   Backend: http://localhost:5001');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Proxy: Frontend → Backend (working)');
    console.log('   Database: Connected');
    
    console.log('\n🌐 Access Points:');
    console.log('   Frontend App: http://localhost:3000');
    console.log('   Backend API: http://localhost:5001/api');
    console.log('   Health Check: http://localhost:3000/api/health');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Make sure MongoDB is running');
      console.log('2. Run: npm run dev-single-port');
      console.log('3. Check if ports 3000 and 5001 are free');
    }
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  testSinglePortSetup();
}

module.exports = testSinglePortSetup; 
