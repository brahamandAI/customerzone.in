const mongoose = require('mongoose');
const fileStorage = require('./utils/fileStorage');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Import Expense model
const Expense = require('./models/Expense');

async function checkSpecificExpense() {
  console.log('🔍 Checking Specific Expense EXP-0003');
  console.log('=====================================\n');

  try {
    // Get the specific expense
    const expense = await Expense.findOne({ expenseNumber: 'EXP-0003' });
    
    if (!expense) {
      console.log('❌ Expense EXP-0003 not found!');
      return;
    }

    console.log(`📄 Expense: ${expense.expenseNumber} - ${expense.title}`);
    console.log(`Status: ${expense.status}`);
    console.log(`Submitted By: ${expense.submittedBy}`);
    console.log(`Submission Date: ${expense.submissionDate}`);
    console.log(`Amount: ${expense.amount}`);
    console.log(`Category: ${expense.category}`);
    console.log(`Attachments count: ${expense.attachments ? expense.attachments.length : 0}`);
    
    if (expense.attachments && expense.attachments.length > 0) {
      console.log('\n📎 Attachments:');
      expense.attachments.forEach((attachment, index) => {
        console.log(`  ${index + 1}. ${attachment.originalName} (${attachment.mimetype})`);
        console.log(`     Path: ${attachment.path}`);
        console.log(`     Size: ${attachment.size} bytes`);
        console.log(`     Upload Date: ${attachment.uploadDate}`);
        console.log(`     Is Receipt: ${attachment.isReceipt}`);
        
        // Check if file exists on disk
        const fileInfo = fileStorage.getFileInfo(attachment.path);
        console.log(`     File exists: ${fileInfo.exists}`);
        
        if (fileInfo.exists) {
          console.log(`     Actual file size: ${fileInfo.size} bytes`);
        } else {
          console.log(`     ❌ File missing from disk!`);
        }
      });
    } else {
      console.log('\n❌ No attachments found in this expense');
    }

    // Check if there are any files in the uploads directory
    console.log('\n📁 Checking uploads directory...');
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
        if (files.length > 0) {
          files.forEach(file => {
            console.log(`  - ${file}`);
          });
        } else {
          console.log('  No files found in uploads directory');
        }
      }
    }

  } catch (error) {
    console.error('❌ Error checking expense:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the check
checkSpecificExpense(); 