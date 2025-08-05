const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./backend/models/User');

async function checkUserExists() {
  try {
    console.log('🔍 Checking if user exists...');
    
    const userId = '6868e7442396774193cd0a1e';
    console.log('User ID to check:', userId);
    
    // Check if user exists
    const user = await User.findById(userId);
    
    if (user) {
      console.log('✅ User found:');
      console.log('- Name:', user.name);
      console.log('- Email:', user.email);
      console.log('- Role:', user.role);
      console.log('- isActive:', user.isActive);
      console.log('- Created:', user.createdAt);
    } else {
      console.log('❌ User not found in database');
    }
    
    // Also check all users to see what's available
    console.log('\n📋 All users in database:');
    const allUsers = await User.find({}).select('name email role isActive createdAt');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role} - Active: ${user.isActive}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkUserExists(); 