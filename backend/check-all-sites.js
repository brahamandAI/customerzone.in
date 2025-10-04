require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Expense = require('./models/Expense');
const Site = require('./models/Site');
const User = require('./models/User');
const PendingApprover = require('./models/PendingApprovers');

async function checkAllSites() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rakshak-expense';
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  
  console.log('🔍 Checking all sites...');
  const sites = await Site.find({ isActive: true }).select('name code');
  console.log('📊 Sites found:', sites.length);
  sites.forEach(site => {
    console.log(`- ${site.name} (${site.code})`);
  });
  
  console.log('\n🔍 Checking all expenses by site...');
  const allExpenses = await Expense.find({
    isActive: true,
    isDeleted: false
  }).populate('site', 'name code').populate('submittedBy', 'name email');
  
  console.log('📊 Total expenses found:', allExpenses.length);
  
  // Group by site
  const expensesBySite = {};
  allExpenses.forEach(exp => {
    const siteName = exp.site?.name || 'Unknown Site';
    if (!expensesBySite[siteName]) {
      expensesBySite[siteName] = [];
    }
    expensesBySite[siteName].push(exp);
  });
  
  Object.keys(expensesBySite).forEach(siteName => {
    console.log(`\n📍 ${siteName}: ${expensesBySite[siteName].length} expenses`);
    expensesBySite[siteName].forEach(exp => {
      console.log(`  - ${exp.expenseNumber}: ${exp.title} - ₹${exp.amount} - Status: ${exp.status}`);
    });
  });
  
  // Check L2 assignments for approved_l1 expenses
  console.log('\n🔍 Checking L2 assignments for approved_l1 expenses...');
  const l1ApprovedExpenses = allExpenses.filter(exp => exp.status === 'approved_l1');
  console.log('📊 L1 approved expenses:', l1ApprovedExpenses.length);
  
  for (const exp of l1ApprovedExpenses) {
    const l2Assignments = await PendingApprover.find({
      expense: exp._id,
      level: 2
    }).populate('approver', 'name email');
    
    console.log(`\nExpense ${exp.expenseNumber} (${exp.site?.name}):`);
    console.log(`  Status: ${exp.status}`);
    console.log(`  L2 Assignments: ${l2Assignments.length}`);
    l2Assignments.forEach(pa => {
      console.log(`    - ${pa.approver.name} (${pa.approver.email}) - Status: ${pa.status}`);
    });
  }
  
  await mongoose.disconnect();
}

checkAllSites().catch(console.error);
