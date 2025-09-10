// Quick test for Fraud & Policy Violation Detection
// Usage: NODE_ENV=development node backend/test-fraud-detection.js

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');

const Expense = require('./models/Expense');
const User = require('./models/User');
const Site = require('./models/Site');
const policyService = require('./services/policy.service');

async function ensureDemoUserAndSite() {
  let site = await Site.findOne({ isActive: true });
  if (!site) {
    site = await Site.create({
      name: 'Demo Site',
      code: 'DEMO',
      description: 'Auto-created for fraud test',
      location: { address: 'NA', city: 'Delhi', state: 'Delhi', pincode: '110001' },
      budget: { monthly: 100000, yearly: 1200000 },
      createdBy: new mongoose.Types.ObjectId()
    });
  }

  let user = await User.findOne({ role: 'submitter', site: site._id });
  if (!user) {
    user = await User.create({
      name: 'Demo Submitter',
      email: `demo.submitter.${Date.now()}@example.com`,
      password: 'hashed',
      role: 'submitter',
      employeeId: `EMP${Math.floor(Math.random()*10000)}`,
      department: 'Ops',
      site: site._id,
      isActive: true
    });
  }

  return { user, site };
}

async function main() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rakshak-expense';
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('✅ Connected to MongoDB');

  const { user, site } = await ensureDemoUserAndSite();
  console.log('Using site:', site.name, site._id.toString());
  console.log('Using user:', user.name, user._id.toString());

  // Pick an existing attachment file to simulate receipt
  const sampleDir = path.join(__dirname, 'uploads', 'expense-attachments');
  const files = fs.existsSync(sampleDir) ? fs.readdirSync(sampleDir).filter(f => f.endsWith('.pdf') || f.endsWith('.jpg') || f.endsWith('.png')) : [];
  if (files.length === 0) {
    console.log('⚠️ No sample files found in uploads/expense-attachments. Duplicate test will run without exact receipt hash.');
  }
  const samplePath = files.length > 0 ? path.join(sampleDir, files[0]) : null;
  const fileBuffer = samplePath ? fs.readFileSync(samplePath) : null;

  const baseData = {
    expenseNumber: `EXP-${Math.floor(Math.random()*9000 + 1000)}`,
    title: 'Taxi - Barista visit',
    description: 'Test duplicate detection',
    amount: 250,
    currency: 'INR',
    category: 'Travel',
    subcategory: 'Taxi',
    expenseDate: new Date(),
    submittedBy: user._id,
    site: site._id,
    department: 'Ops',
    attachments: samplePath ? [{
      filename: path.basename(samplePath),
      originalName: path.basename(samplePath),
      path: samplePath,
      size: fs.statSync(samplePath).size,
      mimetype: 'application/pdf',
      uploadDate: new Date(),
      isReceipt: true
    }] : []
  };

  // First expense (seed)
  const receiptHash = fileBuffer ? policyService.computeReceiptHash(fileBuffer) : null;
  const normalizedKey = policyService.computeNormalizedKey({ amount: baseData.amount, date: baseData.expenseDate, vendor: baseData.title });

  const first = new Expense({ ...baseData, receiptHash, normalizedKey });
  await first.save();
  console.log('📝 Created seed expense:', first._id.toString());

  // Second expense (should flag duplicate/soft-duplicate)
  const secondData = { ...baseData, expenseNumber: `EXP-${Math.floor(Math.random()*9000 + 1000)}` };
  const evaluation = await policyService.evaluateExpense({ ...secondData, receiptHash, normalizedKey });
  console.log('🔎 Evaluation for second expense:', evaluation);

  const second = new Expense({ ...secondData, receiptHash, normalizedKey, policyFlags: evaluation.flags, riskScore: evaluation.riskScore, status: evaluation.nextAction === 'ESCALATE' ? 'under_review' : 'submitted' });
  await second.save();
  console.log('✅ Saved second expense:', second._id.toString());

  // Fetch back and print flags
  const saved = await Expense.findById(second._id).lean();
  console.log('📌 Saved flags:', saved.policyFlags, 'risk:', saved.riskScore, 'status:', saved.status);

  // Cleanup note
  console.log('\nℹ️ You can delete test expenses later by IDs:', first._id.toString(), second._id.toString());

  await mongoose.disconnect();
  console.log('🔌 Disconnected');
}

main().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});


