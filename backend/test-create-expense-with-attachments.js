const mongoose = require('mongoose');
const fileStorage = require('./utils/fileStorage');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Import models
const Expense = require('./models/Expense');
const User = require('./models/User');
const Site = require('./models/Site');

async function createTestExpenseWithAttachments() {
  console.log('🧪 Creating Test Expense with Attachments');
  console.log('==========================================\n');

  try {
    // 1. Get a test user and site
    const testUser = await User.findOne({ role: 'submitter' });
    const testSite = await Site.findOne();
    
    if (!testUser || !testSite) {
      console.log('❌ Test user or site not found. Creating test data...');
      
      // Create test site if not exists
      let site = await Site.findOne();
      if (!site) {
        site = new Site({
          name: 'Test Site',
          code: 'TEST001',
          location: 'Test Location',
          budget: 100000,
          monthlyBudget: 10000
        });
        await site.save();
        console.log('✅ Created test site');
      }
      
      // Create test user if not exists
      let user = await User.findOne({ role: 'submitter' });
      if (!user) {
        user = new User({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'submitter',
          site: site._id,
          department: 'Operations',
          isActive: true
        });
        await user.save();
        console.log('✅ Created test user');
      }
    }

    const user = testUser || await User.findOne({ role: 'submitter' });
    const site = testSite || await Site.findOne();

    // 2. Create mock attachments data
    const mockAttachments = [
      {
        filename: 'test_receipt_1.pdf',
        originalName: 'fuel_receipt.pdf',
        path: 'expenses/2024/01/1703123456789_uuid1.pdf',
        size: 1024000, // 1MB
        mimetype: 'application/pdf',
        uploadDate: new Date(),
        isReceipt: true
      },
      {
        filename: 'test_invoice_1.pdf',
        originalName: 'service_invoice.pdf',
        path: 'expenses/2024/01/1703123456790_uuid2.pdf',
        size: 2048000, // 2MB
        mimetype: 'application/pdf',
        uploadDate: new Date(),
        isReceipt: false
      }
    ];

    // 3. Create test expense
    const testExpense = new Expense({
      expenseNumber: 'EXP-9999',
      title: 'Test Expense with Attachments',
      description: 'This is a test expense to verify attachment functionality',
      amount: 5000,
      currency: 'INR',
      category: 'Fuel',
      expenseDate: new Date(),
      submissionDate: new Date(),
      submittedBy: user._id,
      site: site._id,
      department: 'Operations',
      attachments: mockAttachments,
      status: 'submitted',
      isActive: true
    });

    await testExpense.save();
    console.log('✅ Created test expense with attachments');
    console.log(`Expense ID: ${testExpense._id}`);
    console.log(`Expense Number: ${testExpense.expenseNumber}`);
    console.log(`Attachments count: ${testExpense.attachments.length}`);

    // 4. Create actual files in file system
    const fs = require('fs');
    const path = require('path');
    
    for (const attachment of mockAttachments) {
      const filePath = path.join(__dirname, 'uploads', attachment.path);
      const dirPath = path.dirname(filePath);
      
      // Create directory if not exists
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      // Create a dummy PDF file
      const dummyPdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test PDF File) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF';
      
      fs.writeFileSync(filePath, dummyPdfContent);
      console.log(`✅ Created file: ${filePath}`);
    }

    console.log('\n🎉 Test expense created successfully!');
    console.log('You can now test the attachment functionality in the approval dialog.');

  } catch (error) {
    console.error('❌ Error creating test expense:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
createTestExpenseWithAttachments(); 