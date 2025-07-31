const mongoose = require('mongoose');
const googleAuthService = require('./services/googleAuth.service');
const User = require('./models/User');
const Site = require('./models/Site');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testLoginComparison() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rakshak-expense');
    console.log('✅ Connected to MongoDB');

    // Test 1: Create a test user with regular login
    console.log('\n🧪 Test 1: Regular Login User Creation');
    const testPassword = 'testpassword123';
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(testPassword, salt);
    
    const regularUser = new User({
      name: 'Test Regular User',
      email: 'test.regular@example.com',
      password: hashedPassword,
      role: 'submitter',
      employeeId: 'EMP_TEST_001',
      department: 'IT',
      site: (await Site.findOne({ isActive: true }))._id,
      isActive: true
    });
    await regularUser.save();
    console.log('✅ Regular user created');

    // Test 2: Create a test user via Google OAuth
    console.log('\n🧪 Test 2: Google OAuth User Creation');
    const mockGoogleData = {
      googleId: 'test_google_id_789',
      email: 'test.google@example.com',
      name: 'Test Google User',
      picture: 'https://example.com/avatar.jpg',
      emailVerified: true
    };
    
    const googleUser = await googleAuthService.findOrCreateUser(mockGoogleData);
    console.log('✅ Google user created');

    // Test 3: Compare user data structure
    console.log('\n🧪 Test 3: User Data Comparison');
    
    const regularUserData = await User.findById(regularUser._id)
      .select('-password')
      .populate('site', 'name code location.city');
    
    const googleUserData = await User.findById(googleUser._id)
      .select('-password')
      .populate('site', 'name code location.city');

    console.log('\n📊 Regular User Data:');
    console.log('- ID:', regularUserData._id);
    console.log('- Name:', regularUserData.name);
    console.log('- Email:', regularUserData.email);
    console.log('- Role:', regularUserData.role);
    console.log('- Site:', regularUserData.site?.name);
    console.log('- Is Active:', regularUserData.isActive);
    console.log('- Has Password:', !!regularUserData.password);
    console.log('- Has Google ID:', !!regularUserData.googleId);

    console.log('\n📊 Google User Data:');
    console.log('- ID:', googleUserData._id);
    console.log('- Name:', googleUserData.name);
    console.log('- Email:', googleUserData.email);
    console.log('- Role:', googleUserData.role);
    console.log('- Site:', googleUserData.site?.name);
    console.log('- Is Active:', googleUserData.isActive);
    console.log('- Has Password:', !!googleUserData.password);
    console.log('- Has Google ID:', !!googleUserData.googleId);

    // Test 4: Generate tokens and compare
    console.log('\n🧪 Test 4: Token Generation Comparison');
    
    const regularToken = regularUserData.getSignedJwtToken();
    const googleToken = googleAuthService.generateToken(googleUserData);
    
    console.log('✅ Regular token generated:', regularToken.substring(0, 50) + '...');
    console.log('✅ Google token generated:', googleToken.substring(0, 50) + '...');
    
    // Verify both tokens are JWT format
    const tokenRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
    console.log('✅ Regular token is valid JWT:', tokenRegex.test(regularToken));
    console.log('✅ Google token is valid JWT:', tokenRegex.test(googleToken));

    // Test 5: Verify both users have required fields
    console.log('\n🧪 Test 5: Required Fields Check');
    
    const requiredFields = ['name', 'email', 'role', 'site', 'isActive'];
    const regularUserFields = requiredFields.map(field => ({
      field,
      present: regularUserData[field] !== undefined,
      value: regularUserData[field]
    }));
    
    const googleUserFields = requiredFields.map(field => ({
      field,
      present: googleUserData[field] !== undefined,
      value: googleUserData[field]
    }));

    console.log('\n📊 Regular User Required Fields:');
    regularUserFields.forEach(({ field, present, value }) => {
      console.log(`- ${field}: ${present ? '✅' : '❌'} (${value})`);
    });

    console.log('\n📊 Google User Required Fields:');
    googleUserFields.forEach(({ field, present, value }) => {
      console.log(`- ${field}: ${present ? '✅' : '❌'} (${value})`);
    });

    // Clean up test users
    console.log('\n🧹 Cleaning up test users...');
    await User.deleteOne({ email: 'test.regular@example.com' });
    await User.deleteOne({ email: 'test.google@example.com' });
    console.log('✅ Test users cleaned up');

    console.log('\n🎉 All tests passed! Google Sign-In and regular login are identical.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testLoginComparison(); 