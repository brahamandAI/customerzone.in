const mongoose = require('mongoose');
const User = require('./models/User');
const Site = require('./models/Site');
const Expense = require('./models/Expense');
const ApprovalHistory = require('./models/ApprovalHistory');
const Comment = require('./models/Comments');
const Notification = require('./models/Notifications');
const PendingApprover = require('./models/PendingApprovers');
const Report = require('./models/Reports');

require('dotenv').config();

async function testMongooseMigration() {
  console.log('🧪 Testing Mongoose Migration...\n');

  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rakshak-expense', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully!\n');

    // Test User Model
    console.log('👤 Testing User Model...');
    const userCount = await User.countDocuments();
    console.log(`✅ Users collection: ${userCount} documents found`);

    // Test Site Model
    console.log('🏢 Testing Site Model...');
    const siteCount = await Site.countDocuments();
    console.log(`✅ Sites collection: ${siteCount} documents found`);

    // Test Expense Model
    console.log('💰 Testing Expense Model...');
    const expenseCount = await Expense.countDocuments();
    console.log(`✅ Expenses collection: ${expenseCount} documents found`);

    // Test ApprovalHistory Model
    console.log('📋 Testing ApprovalHistory Model...');
    const approvalCount = await ApprovalHistory.countDocuments();
    console.log(`✅ ApprovalHistory collection: ${approvalCount} documents found`);

    // Test Comment Model
    console.log('💬 Testing Comment Model...');
    const commentCount = await Comment.countDocuments();
    console.log(`✅ Comments collection: ${commentCount} documents found`);

    // Test Notification Model
    console.log('🔔 Testing Notification Model...');
    const notificationCount = await Notification.countDocuments();
    console.log(`✅ Notifications collection: ${notificationCount} documents found`);

    // Test PendingApprover Model
    console.log('⏳ Testing PendingApprover Model...');
    const pendingCount = await PendingApprover.countDocuments();
    console.log(`✅ PendingApprovers collection: ${pendingCount} documents found`);

    // Test Report Model
    console.log('📊 Testing Report Model...');
    const reportCount = await Report.countDocuments();
    console.log(`✅ Reports collection: ${reportCount} documents found`);

    // Test a sample query
    console.log('\n🔍 Testing Sample Queries...');
    
    // Get users with their sites
    const users = await User.find().populate('site', 'name code').limit(3);
    console.log(`✅ Sample users with sites: ${users.length} found`);
    
    // Get expenses with populated data
    const expenses = await Expense.find()
      .populate('submittedBy', 'name email')
      .populate('site', 'name code')
      .limit(3);
    console.log(`✅ Sample expenses with populated data: ${expenses.length} found`);

    // Test aggregation
    console.log('\n📈 Testing Aggregation...');
    const expenseStats = await Expense.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    console.log('✅ Expense statistics by status:', expenseStats);

    console.log('\n🎉 All Tests Passed! Mongoose Migration Successful!');
    console.log('\n📋 Summary:');
    console.log(`- Users: ${userCount}`);
    console.log(`- Sites: ${siteCount}`);
    console.log(`- Expenses: ${expenseCount}`);
    console.log(`- Approval History: ${approvalCount}`);
    console.log(`- Comments: ${commentCount}`);
    console.log(`- Notifications: ${notificationCount}`);
    console.log(`- Pending Approvers: ${pendingCount}`);
    console.log(`- Reports: ${reportCount}`);

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the test
testMongooseMigration(); 