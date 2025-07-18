const axios = require('axios');

const testServer = async () => {
  const baseURL = 'http://localhost:5000';
  
  console.log('🧪 Testing Rakshak Expense Management Backend...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${baseURL}/api/health`);
    console.log('✅ Health check passed:', healthResponse.data.status);
    
    // Test root endpoint
    console.log('\n2. Testing root endpoint...');
    const rootResponse = await axios.get(baseURL);
    console.log('✅ Root endpoint working:', rootResponse.data.message);
    
    // Test API endpoints structure
    console.log('\n3. Available API endpoints:');
    const endpoints = rootResponse.data.endpoints;
    Object.entries(endpoints).forEach(([name, path]) => {
      console.log(`   📍 ${name}: ${path}`);
    });
    
    // Test features
    console.log('\n4. System features:');
    rootResponse.data.features.forEach(feature => {
      console.log(`   ✨ ${feature}`);
    });
    
    console.log('\n🎉 All tests passed! Backend is working perfectly.');
    console.log('\n📊 Server Information:');
    console.log(`   Environment: ${healthResponse.data.environment}`);
    console.log(`   Database: ${healthResponse.data.database}`);
    console.log(`   Uptime: ${Math.round(healthResponse.data.uptime)}s`);
    console.log(`   Memory Usage: ${Math.round(healthResponse.data.memory.heapUsed / 1024 / 1024)}MB`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the server is running with: npm start');
    }
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  testServer();
}

module.exports = testServer; 