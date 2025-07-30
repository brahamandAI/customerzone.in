const mongoose = require('mongoose');
const Site = require('./backend/models/Site');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/expense-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testSiteStats() {
  try {
    console.log('🔍 Testing Site Statistics...\n');

    // Get all sites
    const sites = await Site.find({ isActive: true });
    
    console.log(`📊 Found ${sites.length} active sites:\n`);
    
    sites.forEach((site, index) => {
      console.log(`${index + 1}. ${site.name} (${site.code})`);
      console.log(`   Budget: ₹${site.budget?.monthly?.toLocaleString() || 0}`);
      console.log(`   Monthly Spend: ₹${site.statistics?.monthlySpend?.toLocaleString() || 0}`);
      console.log(`   Budget Utilization: ${site.budgetUtilization}%`);
      console.log(`   Remaining Budget: ₹${site.remainingBudget?.toLocaleString() || 0}`);
      console.log(`   Total Expenses: ${site.statistics?.totalExpenses || 0}`);
      console.log(`   Total Amount: ₹${site.statistics?.totalAmount?.toLocaleString() || 0}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testSiteStats(); 