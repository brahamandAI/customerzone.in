const mongoose = require('mongoose');
const Expense = require('./models/Expense');
const Site = require('./models/Site');
const User = require('./models/User');
require('dotenv').config();

async function checkExpenses() {
  try {
    console.log('🔍 Checking Expenses and Site Statistics...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rakshak-expense', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Get all expenses
    const expenses = await Expense.find({ isActive: true, isDeleted: false })
      .populate('submittedBy', 'name email')
      .populate('site', 'name code')
      .sort({ createdAt: -1 });

    console.log(`📊 Found ${expenses.length} active expenses:\n`);

    if (expenses.length === 0) {
      console.log('❌ No expenses found! This explains why monthly spend is 0.');
      return;
    }

    // Group expenses by site and status
    const siteExpenses = {};
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    expenses.forEach(expense => {
      const siteName = expense.site?.name || 'Unknown Site';
      const isThisMonth = expense.createdAt >= currentMonth && expense.createdAt < nextMonth;
      
      if (!siteExpenses[siteName]) {
        siteExpenses[siteName] = {
          total: 0,
          thisMonth: 0,
          approved: 0,
          approvedThisMonth: 0,
          expenses: []
        };
      }

      siteExpenses[siteName].total += expense.amount;
      siteExpenses[siteName].expenses.push({
        amount: expense.amount,
        status: expense.status,
        date: expense.createdAt,
        isThisMonth
      });

      if (isThisMonth) {
        siteExpenses[siteName].thisMonth += expense.amount;
      }

      if (expense.status === 'approved') {
        siteExpenses[siteName].approved += expense.amount;
        if (isThisMonth) {
          siteExpenses[siteName].approvedThisMonth += expense.amount;
        }
      }
    });

    // Display results
    Object.keys(siteExpenses).forEach(siteName => {
      const data = siteExpenses[siteName];
      console.log(`🏢 ${siteName}:`);
      console.log(`   Total Expenses: ₹${data.total.toLocaleString()}`);
      console.log(`   This Month: ₹${data.thisMonth.toLocaleString()}`);
      console.log(`   Approved Total: ₹${data.approved.toLocaleString()}`);
      console.log(`   Approved This Month: ₹${data.approvedThisMonth.toLocaleString()}`);
      console.log(`   Expense Count: ${data.expenses.length}`);
      console.log('');
    });

    // Check site statistics
    console.log('📈 Current Site Statistics:');
    const sites = await Site.find({ isActive: true });
    sites.forEach(site => {
      console.log(`${site.name}:`);
      console.log(`   Monthly Budget: ₹${site.budget?.monthly?.toLocaleString() || 0}`);
      console.log(`   Monthly Spend: ₹${site.statistics?.monthlySpend?.toLocaleString() || 0}`);
      console.log(`   Budget Utilization: ${site.budgetUtilization}%`);
      console.log('');
    });

    // Check if expenses should be updating site statistics
    console.log('🔍 Analysis:');
    const totalApprovedThisMonth = Object.values(siteExpenses).reduce((sum, data) => sum + data.approvedThisMonth, 0);
    console.log(`Total approved expenses this month: ₹${totalApprovedThisMonth.toLocaleString()}`);
    console.log(`Total monthly spend in site statistics: ₹${sites.reduce((sum, site) => sum + (site.statistics?.monthlySpend || 0), 0).toLocaleString()}`);
    
    if (totalApprovedThisMonth > 0 && sites.reduce((sum, site) => sum + (site.statistics?.monthlySpend || 0), 0) === 0) {
      console.log('⚠️  ISSUE: Approved expenses exist but site statistics are not updated!');
      console.log('💡 This confirms the bug - site statistics are not being updated when expenses are approved.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkExpenses(); 