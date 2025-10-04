require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Expense = require('./models/Expense');
const PendingApprover = require('./models/PendingApprovers');

async function checkRohiniExpenses() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rakshak-expense';
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  
  console.log('🔍 Checking Rohini site expenses...');
  const rohiniExpenses = await Expense.find({
    'site.name': /rohini/i,
    isActive: true,
    isDeleted: false
  }).populate('site', 'name code').populate('submittedBy', 'name email');
  
  console.log('📊 Rohini expenses found:', rohiniExpenses.length);
  rohiniExpenses.forEach(exp => {
    console.log(`- ${exp.expenseNumber}: ${exp.title} - ₹${exp.amount} - Status: ${exp.status} - Site: ${exp.site?.name}`);
  });
  
  console.log('\n🔍 Checking L2 assignments for Rohini expenses...');
  for (const exp of rohiniExpenses) {
    const l2Assignments = await PendingApprover.find({
      expense: exp._id,
      level: 2
    }).populate('approver', 'name email');
    
    console.log(`\nExpense ${exp.expenseNumber}:`);
    console.log(`  Status: ${exp.status}`);
    console.log(`  L2 Assignments: ${l2Assignments.length}`);
    l2Assignments.forEach(pa => {
      console.log(`    - ${pa.approver.name} (${pa.approver.email}) - Status: ${pa.status}`);
    });
  }
  
  await mongoose.disconnect();
}

checkRohiniExpenses().catch(console.error);
