const mongoose = require('mongoose');

// Connect to MongoDB
async function checkUsers() {
  try {
    await mongoose.connect('mongodb+srv://rakshaksecuritas:rakshak123@cluster0.2wmxzb7.mongodb.net/rakshak-expense-management?retryWrites=true&w=majority');
    console.log('✅ Connected to MongoDB');
    
    const User = require('./backend/models/User');
    
    // Get all users
    const users = await User.find({}).select('name email role site');
    
    console.log('\n👥 All Users in System:');
    console.log('======================');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Site: ${user.site?.name || 'No Site'}`);
      console.log('');
    });
    
    // Find L2 approvers specifically
    const l2Approvers = users.filter(user => user.role === 'l2_approver');
    console.log('\n🔍 L2 Approvers:');
    console.log('================');
    
    l2Approvers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Site: ${user.site?.name || 'No Site'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

checkUsers();
