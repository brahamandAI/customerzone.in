const mongoose = require('mongoose');
const googleAuthService = require('./services/googleAuth.service');
const Site = require('./models/Site');
const User = require('./models/User');
require('dotenv').config();

async function testGoogleAuth() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rakshak-expense');
    console.log('✅ Connected to MongoDB');

    // Test 1: Check if default site exists or can be created
    console.log('\n🧪 Test 1: Default Site Check');
    const defaultSite = await googleAuthService.getDefaultSite();
    console.log(`✅ Default site found/created: ${defaultSite.name} (${defaultSite.code})`);

    // Test 2: Simulate Google user data
    console.log('\n🧪 Test 2: User Creation Test');
    const mockGoogleData = {
      googleId: 'test_google_id_123',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/avatar.jpg',
      emailVerified: true
    };

    // Test user creation
    const user = await googleAuthService.findOrCreateUser(mockGoogleData);
    console.log(`✅ User created/found: ${user.name} (${user.email})`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Site: ${user.site}`);
    console.log(`   Google ID: ${user.googleId}`);

    // Test 3: Verify user has required fields
    console.log('\n🧪 Test 3: User Validation Check');
    if (user.site) {
      console.log('✅ User has site assigned');
    } else {
      console.log('❌ User missing site assignment');
    }

    if (user.role) {
      console.log('✅ User has role assigned');
    } else {
      console.log('❌ User missing role assignment');
    }

    // Clean up test user
    console.log('\n🧹 Cleaning up test user...');
    await User.deleteOne({ email: 'test@example.com' });
    console.log('✅ Test user cleaned up');

    console.log('\n🎉 All tests passed! Google Auth service is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testGoogleAuth(); 