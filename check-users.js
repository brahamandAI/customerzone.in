const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rakshak_expense_manager')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// User model
const User = require('./backend/models/User');

async function checkUsers() {
  try {
    console.log('🔍 Checking existing users...\n');
    
    const users = await User.find({}).select('email role name site isActive');
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log(`✅ Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Site: ${user.site || 'No site assigned'}`);
      console.log(`   Active: ${user.isActive}`);
      console.log('');
    });
    
    // Find admin users
    const adminUsers = users.filter(user => 
      user.role === 'l3_approver' || user.role === 'finance' || user.role === 'admin'
    );
    
    if (adminUsers.length > 0) {
      console.log('👑 Admin users found:');
      adminUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    } else {
      console.log('❌ No admin users found');
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkUsers();
