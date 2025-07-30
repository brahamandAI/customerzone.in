const mongoose = require('mongoose');
const User = require('./backend/models/User');
const Site = require('./backend/models/Site');
const Expense = require('./backend/models/Expense');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/expense-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testBudgetUtilization() {
  try {
    console.log('🔍 Testing Budget Utilization...\n');

    // Find a submitter user
    const submitter = await User.findOne({ role: 'submitter' }).populate('site');
    console.log('📋 Submitter User:', {
      _id: submitter._id,
      name: submitter.name,
      role: submitter.role,
      siteId: submitter.site?._id,
      siteName: submitter.site?.name
    });

    if (!submitter.site) {
      console.log('❌ Submitter has no site assigned!');
      return;
    }

    // Get site data
    const site = await Site.findById(submitter.site._id);
    console.log('\n🏢 Site Data:', {
      siteId: site._id,
      siteName: site.name,
      budget: {
        monthly: site.budget?.monthly,
        alertThreshold: site.budget?.alertThreshold
      },
      statistics: {
        monthlySpend: site.statistics?.monthlySpend,
        totalAmount: site.statistics?.totalAmount,
        totalExpenses: site.statistics?.totalExpenses
      }
    });

    // Check virtual properties
    console.log('\n📊 Virtual Properties:');
    console.log('Budget Utilization:', site.budgetUtilization);
    console.log('Remaining Budget:', site.remainingBudget);
    console.log('Budget Status:', site.budgetStatus);

    // Manual calculation
    const manualUtilization = site.budget?.monthly > 0 ? 
      Math.round((site.statistics?.monthlySpend / site.budget?.monthly) * 100) : 0;
    
    console.log('\n🧮 Manual Calculation:');
    console.log('Monthly Budget:', site.budget?.monthly);
    console.log('Monthly Spend:', site.statistics?.monthlySpend);
    console.log('Manual Utilization %:', manualUtilization);

    // Check user's expenses
    const userExpenses = await Expense.find({
      submittedBy: submitter._id,
      isActive: true,
      isDeleted: false
    });

    console.log('\n💰 User Expenses:');
    console.log('Total Expenses:', userExpenses.length);
    console.log('Total Amount:', userExpenses.reduce((sum, exp) => sum + exp.amount, 0));
    
    // Check approved expenses this month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const monthlyExpenses = userExpenses.filter(exp => 
      exp.createdAt >= currentMonth && exp.createdAt < nextMonth
    );

    console.log('\n📅 This Month Expenses:');
    console.log('Monthly Expenses Count:', monthlyExpenses.length);
    console.log('Monthly Expenses Amount:', monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0));

    // Check if site statistics are being updated
    console.log('\n🔄 Site Statistics Update Check:');
    console.log('Are statistics being updated when expenses are approved?');
    
    // Check recent expenses and their status
    const recentExpenses = await Expense.find({
      submittedBy: submitter._id,
      isActive: true,
      isDeleted: false
    }).sort({ createdAt: -1 }).limit(5);

    console.log('\n📝 Recent 5 Expenses:');
    recentExpenses.forEach((exp, index) => {
      console.log(`${index + 1}. Amount: ₹${exp.amount}, Status: ${exp.status}, Date: ${exp.createdAt.toDateString()}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testBudgetUtilization(); 