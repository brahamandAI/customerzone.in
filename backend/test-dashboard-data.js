const mongoose = require('mongoose');
const Expense = require('./models/Expense');
const User = require('./models/User');
const Site = require('./models/Site');
require('dotenv').config();

async function testDashboardData() {
  try {
    console.log('🔍 Testing Dashboard Data...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rakshak-expense', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Find a submitter user
    const submitter = await User.findOne({ role: 'submitter' });
    console.log(`📋 Testing for user: ${submitter.name} (${submitter.role})`);

    // Get user's expenses
    const userExpenses = await Expense.find({
      submittedBy: submitter._id,
      isActive: true,
      isDeleted: false
    }).populate('site', 'name code');

    console.log(`\n💰 User Expenses: ${userExpenses.length} total`);

    // Test Top Categories
    console.log('\n📊 Testing Top Categories:');
    const topCategories = await Expense.aggregate([
      {
        $match: {
          submittedBy: submitter._id,
          isActive: true,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalAmount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Calculate total user expenses
    const totalUserExpenses = await Expense.aggregate([
      {
        $match: {
          submittedBy: submitter._id,
          isActive: true,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const userTotalAmount = totalUserExpenses[0]?.totalAmount || 0;
    console.log(`Total User Amount: ₹${userTotalAmount.toLocaleString()}`);

    topCategories.forEach((category, index) => {
      const percentage = userTotalAmount > 0 ? Math.round((category.totalAmount / userTotalAmount) * 100) : 0;
      console.log(`${index + 1}. ${category._id}: ₹${category.totalAmount.toLocaleString()} (${percentage}%)`);
    });

    // Test Recent Activities
    console.log('\n📝 Testing Recent Activities:');
    const recentExpenses = await Expense.find({
      submittedBy: submitter._id,
      isActive: true,
      isDeleted: false
    })
    .populate('site', 'name code')
    .sort({ updatedAt: -1 })
    .limit(5);

    recentExpenses.forEach((expense, index) => {
      let title = '';
      switch (expense.status) {
        case 'submitted': title = 'Expense submitted'; break;
        case 'approved_l1': title = 'Expense approved by L1'; break;
        case 'approved_l2': title = 'Expense approved by L2'; break;
        case 'approved': title = 'Expense finally approved'; break;
        case 'payment_processed': title = 'Payment processed'; break;
        case 'rejected': title = 'Expense rejected'; break;
        default: title = 'Expense updated';
      }

      const timeAgo = getTimeAgo(expense.updatedAt);
      console.log(`${index + 1}. ${title}`);
      console.log(`   ${expense.site?.name || 'Unknown Site'} - ₹${expense.amount.toLocaleString()}`);
      console.log(`   ${timeAgo} (${expense.status})`);
      console.log('');
    });

    // Test Budget Utilization
    console.log('📈 Testing Budget Utilization:');
    const site = await Site.findById(submitter.site._id);
    console.log(`Site: ${site.name}`);
    console.log(`Monthly Budget: ₹${site.budget?.monthly?.toLocaleString() || 0}`);
    console.log(`Monthly Spend: ₹${site.statistics?.monthlySpend?.toLocaleString() || 0}`);
    console.log(`Budget Utilization: ${site.budgetUtilization}%`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Helper function to get time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

testDashboardData(); 