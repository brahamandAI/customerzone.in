const http = require('http');

console.log('🔍 Testing Server Status...\n');

function testServer() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:5001/api/auth/me', (res) => {
      console.log('✅ Server Status:', res.statusCode);
      console.log('📋 Response Headers:', res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📄 Response Body:', data);
        resolve(res.statusCode);
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Server Error:', err.message);
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Server Timeout');
      reject(new Error('Timeout'));
    });
  });
}

testServer()
  .then((statusCode) => {
    if (statusCode < 500) {
      console.log('\n✅ Server is running and responding!');
      console.log('💡 Rate limiting is normal - server is working');
    } else {
      console.log('\n❌ Server has issues');
    }
  })
  .catch((error) => {
    console.log('\n❌ Server not accessible:', error.message);
  }); 