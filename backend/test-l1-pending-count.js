require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Expense = require('./models/Expense');
const User = require('./models/User');
const PendingApprover = require('./models/PendingApprovers');

async function main() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rakshak-expense';
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

  // CHANGE THESE if you want a different submitter/site
  const submitterId = process.argv[2] || null; // e.g., submitter id
  const l1IdParam = process.argv[3] || null;   // optional L1 approver id
  const siteId = process.argv[4] || null;      // optional site filter

  // Pick first L1 approver if not specified
  const l1 = l1IdParam
    ? await User.findById(l1IdParam)
    : await User.findOne({ role: 'l1_approver', isActive: true });
  if (!l1) {
    console.log('No L1 approver found');
    process.exit(0);
  }
  console.log('L1 Approver:', l1.name, l1._id.toString());

  const baseExpenseFilter = { isActive: true, isDeleted: false };
  if (submitterId) baseExpenseFilter.submittedBy = submitterId;
  if (siteId) baseExpenseFilter.site = siteId;

  // All created by submitter (and site if provided)
  const allBySubmitter = await Expense.find(baseExpenseFilter).select('expenseNumber status submittedBy site createdAt');
  console.log('Total expenses (submitter filter):', allBySubmitter.length);

  // L1 pending via PendingApprover rows
  const pa = await PendingApprover.find({ approver: l1._id, status: 'pending' }).select('expense');
  const paExpenseIds = pa.map(x => x.expense);
  const pendingFilter = { _id: { $in: paExpenseIds }, ...baseExpenseFilter, status: { $in: ['submitted', 'under_review'] } };
  const pendingForL1 = await Expense.find(pendingFilter).select('expenseNumber status submittedBy');
  console.log('Pending for L1 (via PendingApprover):', pendingForL1.length);

  // Find missing assignments: submitted/under_review expenses without a PendingApprover for this L1
  const shouldBePending = await Expense.find({ ...baseExpenseFilter, status: { $in: ['submitted', 'under_review'] } }).select('_id expenseNumber status');
  const missing = shouldBePending.filter(e => !paExpenseIds.find(id => id.toString() === e._id.toString()));
  console.log('Missing PendingApprover assignments:', missing.length);
  if (missing.length) {
    console.log('Examples of missing (up to 5):', missing.slice(0, 5).map(m => ({ id: m._id.toString(), no: m.expenseNumber, status: m.status })));
  }

  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });


