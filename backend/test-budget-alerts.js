const mongoose = require('mongoose');
const Site = require('./models/Site');
require('dotenv').config();

async function testBudgetAlerts() {
  try {
    console.log('🔔 Testing Budget Alerts...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rakshak-expense', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Get all sites
    const sites = await Site.find({ isActive: true });
    
    console.log('📊 Budget Alert Status:\n');
    
    sites.forEach((site, index) => {
      console.log(`${index + 1}. ${site.name}:`);
      console.log(`   Monthly Budget: ₹${site.budget?.monthly?.toLocaleString() || 0}`);
      console.log(`   Monthly Spend: ₹${site.statistics?.monthlySpend?.toLocaleString() || 0}`);
      console.log(`   Budget Utilization: ${site.budgetUtilization}%`);
      console.log(`   Alert Threshold: ${site.budget?.alertThreshold || 0}%`);
      console.log(`   Should Send Alert: ${site.shouldSendBudgetAlert() ? '🔴 YES' : '🟢 NO'}`);
      console.log(`   Budget Status: ${site.budgetStatus}`);
      console.log('');
    });

    // Test different scenarios
    console.log('🧪 Testing Alert Scenarios:\n');
    
    // Scenario 1: 50% utilization (no alert)
    const testSite1 = sites[0];
    testSite1.statistics.monthlySpend = testSite1.budget.monthly * 0.5;
    console.log(`Scenario 1 - 50% utilization: ${testSite1.shouldSendBudgetAlert() ? '🔴 Alert' : '🟢 No Alert'}`);
    
    // Scenario 2: 80% utilization (alert threshold)
    testSite1.statistics.monthlySpend = testSite1.budget.monthly * 0.8;
    console.log(`Scenario 2 - 80% utilization: ${testSite1.shouldSendBudgetAlert() ? '🔴 Alert' : '🟢 No Alert'}`);
    
    // Scenario 3: 90% utilization (alert)
    testSite1.statistics.monthlySpend = testSite1.budget.monthly * 0.9;
    console.log(`Scenario 3 - 90% utilization: ${testSite1.shouldSendBudgetAlert() ? '🔴 Alert' : '🟢 No Alert'}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testBudgetAlerts(); 