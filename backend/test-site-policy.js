// Quick test for Site-level Policy evaluation (perCategoryLimits)
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Expense = require('./models/Expense');
const Site = require('./models/Site');
const User = require('./models/User');
const policyService = require('./services/policy.service');

async function ensureDemoUser(siteId) {
  let user = await User.findOne({ role: 'submitter', site: siteId });
  if (!user) {
    user = await User.create({
      name: 'Policy Tester',
      email: `policy.tester.${Date.now()}@example.com`,
      password: 'hashed',
      role: 'submitter',
      employeeId: `EMP${Math.floor(Math.random()*10000)}`,
      department: 'Ops',
      site: siteId,
      isActive: true
    });
  }
  return user;
}

async function main() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rakshak-expense';
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('✅ Connected to MongoDB');

  // Get first active site
  let site = await Site.findOne({ isActive: true });
  if (!site) throw new Error('No site found');
  console.log('Using site:', site.name, site._id.toString());

  // Update site policy: Configure all admin fields for a full test
  site.expensePolicy = site.expensePolicy || {};
  if (!site.expensePolicy.perCategoryLimits || !(site.expensePolicy.perCategoryLimits instanceof Map)) {
    site.expensePolicy.perCategoryLimits = new Map(Object.entries(site.expensePolicy.perCategoryLimits || {}));
  }
  site.expensePolicy.perCategoryLimits.set('TRAVEL', 10);
  site.expensePolicy.cashMax = 50; // low cash cap to trigger CASH_OVER_CAP
  if (!site.expensePolicy.requireDirectorAbove || !(site.expensePolicy.requireDirectorAbove instanceof Map)) {
    site.expensePolicy.requireDirectorAbove = new Map(Object.entries(site.expensePolicy.requireDirectorAbove || {}));
  }
  site.expensePolicy.requireDirectorAbove.set('TRAVEL', 200);
  site.expensePolicy.weekendDisallow = ['FOOD','TRAVEL'];
  site.expensePolicy.duplicateWindowDays = 45; // custom window
  await site.save();
  console.log('🔧 Updated site policy: TRAVEL limit=10, cashMax=50, directorAbove.TRAVEL=200, weekendDisallow=[FOOD,TRAVEL], duplicateWindowDays=45');

  // Ensure user
  const user = await ensureDemoUser(site._id);

  // Create expense-like object
  const expenseLike = {
    expenseNumber: `EXP-${Math.floor(Math.random()*9000 + 1000)}`,
    title: 'City Taxi',
    amount: 250,
    currency: 'INR',
    category: 'Travel',
    expenseDate: new Date(),
    submittedBy: user._id,
    site: site._id,
    department: 'Ops',
    attachments: [],
    paymentMethod: 'Cash'
  };

  // Evaluate
  const evalResult = await policyService.evaluateExpense(expenseLike);
  console.log('🔎 Evaluation result:', evalResult);

  const saved = await Expense.create({ ...expenseLike, receiptHash: evalResult.receiptHash, normalizedKey: evalResult.normalizedKey, policyFlags: evalResult.flags, riskScore: evalResult.riskScore, status: evalResult.nextAction === 'ESCALATE' ? 'under_review' : 'submitted' });
  console.log('✅ Saved expense with flags:', saved._id.toString(), saved.policyFlags, 'risk:', saved.riskScore);

  // Duplicate test (same normalizedKey in window)
  const dupEval = await policyService.evaluateExpense({ ...expenseLike, expenseNumber: `EXP-${Math.floor(Math.random()*9000 + 1000)}` });
  console.log('🔁 Duplicate check result:', dupEval.flags);

  await mongoose.disconnect();
  console.log('🔌 Disconnected');
}

main().catch((e) => { console.error('❌ Test failed:', e); process.exit(1); });


