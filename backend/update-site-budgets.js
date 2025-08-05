const mongoose = require('mongoose');
const Site = require('./models/Site');
require('dotenv').config();

async function updateSiteBudgets() {
  try {
    console.log('🔧 Updating Site Budgets...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rakshak-expense', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Update budgets using direct database update to avoid validation
    const budgetUpdates = [
      { name: 'Rakshak HQ', budget: 100000 },
      { name: 'Mumbai Site A', budget: 75000 },
      { name: 'Mumbai HQ', budget: 150000 },
      { name: 'Mumbai Site B', budget: 20000 }, // Already has budget
      { name: 'Mumbai Site D', budget: 50000 }
    ];

    for (const budgetConfig of budgetUpdates) {
      const result = await Site.updateOne(
        { name: budgetConfig.name },
        { 
          $set: { 
            'budget.monthly': budgetConfig.budget,
            'budget.yearly': budgetConfig.budget * 12,
            'budget.alertThreshold': 80
          }
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated ${budgetConfig.name}: ₹${budgetConfig.budget.toLocaleString()} monthly budget`);
      } else {
        console.log(`⚠️  No changes for ${budgetConfig.name}`);
      }
    }

    console.log('\n🎉 Budget updates completed!');
    
    // Show updated results
    console.log('\n📊 Updated Site Budgets:');
    const sites = await Site.find({ isActive: true });
    sites.forEach(site => {
      console.log(`${site.name}: ₹${site.budget?.monthly?.toLocaleString() || 0} (${site.budgetUtilization}% utilization)`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

updateSiteBudgets(); 