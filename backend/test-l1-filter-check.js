require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Expense = require('./models/Expense');
const User = require('./models/User');
const PendingApprover = require('./models/PendingApprovers');

async function main() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rakshak-expense';
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

  const l1 = await User.findOne({ role: 'l1_approver', isActive: true });
  if (!l1) {
    console.log('No active L1 approver found.');
    process.exit(0);
  }
  console.log('L1:', l1.name, l1._id.toString(), 'site:', l1.site?.toString?.() || l1.site);

  // All PendingApprover rows for this L1
  const pa = await PendingApprover.find({ approver: l1._id, status: 'pending' }).select('expense level');
  const expenseIds = pa.map(x => x.expense);
  console.log('PendingApprover rows:', pa.length);

  if (expenseIds.length === 0) {
    console.log('No pending assignments for L1; nothing would display.');
    await mongoose.disconnect();
    return;
  }

  // Fetch statuses of those expenses
  const exps = await Expense.find({ _id: { $in: expenseIds } }).select('expenseNumber status site');
  const byStatus = exps.reduce((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {});
  console.log('Expenses by status for this L1 assignments:', byStatus);

  // Current route filter for L1 (as in code): status === 'submitted'
  const visibleNow = exps.filter(e => e.status === 'submitted');
  const hiddenNow = exps.filter(e => e.status !== 'submitted');
  console.log('Would be visible (submitted):', visibleNow.map(e => e.expenseNumber));
  console.log('Hidden by filter (e.g., under_review):', hiddenNow.map(e => `${e.expenseNumber}:${e.status}`));

  // Proposed inclusive filter: ['submitted','under_review']
  const visibleProposed = exps.filter(e => ['submitted','under_review'].includes(e.status));
  console.log('With proposed filter, visible would be:', visibleProposed.map(e => `${e.expenseNumber}:${e.status}`));

  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });


