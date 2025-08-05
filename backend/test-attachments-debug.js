const mongoose = require('mongoose');
const fileStorage = require('./utils/fileStorage');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Import Expense model
const Expense = require('./models/Expense');

async function debugAttachments() {
  console.log('🔍 Debugging Attachments Issue');
  console.log('================================\n');

  try {
    // 1. Check if any expenses have attachments
    console.log('1️⃣ Checking expenses with attachments...');
    const expensesWithAttachments = await Expense.find({
      'attachments.0': { $exists: true }
    }).select('expenseNumber title attachments');

    console.log(`Found ${expensesWithAttachments.length} expenses with attachments`);

    if (expensesWithAttachments.length === 0) {
      console.log('❌ No expenses found with attachments!');
      console.log('This means either:');
      console.log('- No files were uploaded during expense creation');
      console.log('- Files were uploaded but not saved to database');
      console.log('- Database structure issue');
      return;
    }

    // 2. Check each expense's attachments
    for (const expense of expensesWithAttachments) {
      console.log(`\n📄 Expense: ${expense.expenseNumber} - ${expense.title}`);
      console.log(`Attachments count: ${expense.attachments.length}`);
      
      expense.attachments.forEach((attachment, index) => {
        console.log(`  Attachment ${index + 1}:`);
        console.log(`    Original Name: ${attachment.originalName}`);
        console.log(`    Filename: ${attachment.filename}`);
        console.log(`    Path: ${attachment.path}`);
        console.log(`    Size: ${attachment.size} bytes`);
        console.log(`    MIME Type: ${attachment.mimetype}`);
        console.log(`    Upload Date: ${attachment.uploadDate}`);
        console.log(`    Is Receipt: ${attachment.isReceipt}`);
        
        // Check if file exists on disk
        const fileInfo = fileStorage.getFileInfo(attachment.path);
        console.log(`    File exists on disk: ${fileInfo.exists}`);
        
        if (fileInfo.exists) {
          console.log(`    Actual file size: ${fileInfo.size} bytes`);
        } else {
          console.log(`    ❌ File missing from disk!`);
        }
      });
    }

    // 3. Check file storage structure
    console.log('\n3️⃣ Checking file storage structure...');
    const fs = require('fs');
    const path = require('path');
    
    const uploadsDir = path.join(__dirname, 'uploads');
    console.log(`Uploads directory: ${uploadsDir}`);
    console.log(`Directory exists: ${fs.existsSync(uploadsDir)}`);
    
    if (fs.existsSync(uploadsDir)) {
      const expensesDir = path.join(uploadsDir, 'expenses');
      console.log(`Expenses directory: ${expensesDir}`);
      console.log(`Directory exists: ${fs.existsSync(expensesDir)}`);
      
      if (fs.existsSync(expensesDir)) {
        const files = fs.readdirSync(expensesDir, { recursive: true });
        console.log(`Files found: ${files.length}`);
        files.forEach(file => {
          console.log(`  - ${file}`);
        });
      }
    }

    // 4. Test file storage utility
    console.log('\n4️⃣ Testing file storage utility...');
    const testFileInfo = fileStorage.getFileInfo('expenses/2024/01/test.pdf');
    console.log('Test file info:', testFileInfo);

  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the debug function
debugAttachments(); 