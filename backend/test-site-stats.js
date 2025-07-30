const mongoose = require('mongoose');
const Site = require('./models/Site');
require('dotenv').config();

async function testSiteStats() {
  try {
    console.log('🔍 Testing Site Statistics...\n');

    // Connect to MongoDB using the same connection as the main server
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rakshak-expense', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Connected to MongoDB');
    console.log('📡 Database connection status:', mongoose.connection.readyState);
    console.log('🗄️  Database name:', mongoose.connection.name);
    
    // Get all sites (including inactive)
    const allSites = await Site.find({});
    console.log(`📊 Found ${allSites.length} total sites:\n`);
    
    if (allSites.length === 0) {
      console.log('❌ No sites found in database!');
      return;
    }
    
    allSites.forEach((site, index) => {
      console.log(`${index + 1}. ${site.name} (${site.code}) - Active: ${site.isActive}`);
      console.log(`   Site ID: ${site._id}`);
      console.log(`   Budget: ₹${site.budget?.monthly?.toLocaleString() || 0}`);
      console.log(`   Monthly Spend: ₹${site.statistics?.monthlySpend?.toLocaleString() || 0}`);
      console.log(`   Budget Utilization: ${site.budgetUtilization}%`);
      console.log(`   Remaining Budget: ₹${site.remainingBudget?.toLocaleString() || 0}`);
      console.log(`   Total Expenses: ${site.statistics?.totalExpenses || 0}`);
      console.log(`   Total Amount: ₹${site.statistics?.totalAmount?.toLocaleString() || 0}`);
      console.log(`   Statistics Object:`, JSON.stringify(site.statistics, null, 2));
      console.log('');
    });

    // Check active sites specifically
    const activeSites = await Site.find({ isActive: true });
    console.log(`✅ Active sites: ${activeSites.length}`);
    
    if (activeSites.length === 0 && allSites.length > 0) {
      console.log('⚠️  All sites are inactive! This is why budget utilization shows 0%.');
      console.log('💡 Solution: Activate at least one site or create a new active site.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testSiteStats(); 