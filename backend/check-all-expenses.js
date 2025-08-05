const mongoose = require('mongoose');
const fileStorage = require('./utils/fileStorage');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Import Expense model
const Expense = require('./models/Expense');

async function checkAllExpenses() {
  console.log('🔍 Checking All Expenses');
  console.log('========================\n');

  try {
    // Get all expenses
    const allExpenses = await Expense.find({}).select('expenseNumber title status submittedBy attachments submissionDate');
    
    console.log(`Found ${allExpenses.length} total expenses\n`);

    // Check each expense
    for (const expense of allExpenses) {
      console.log(`📄 Expense: ${expense.expenseNumber} - ${expense.title}`);
      console.log(`Status: ${expense.status}`);
      console.log(`Submitted By: ${expense.submittedBy}`);
      console.log(`Submission Date: ${expense.submissionDate}`);
      console.log(`Attachments count: ${expense.attachments ? expense.attachments.length : 0}`);
      
      if (expense.attachments && expense.attachments.length > 0) {
        console.log('  Attachments:');
        expense.attachments.forEach((attachment, index) => {
          console.log(`    ${index + 1}. ${attachment.originalName} (${attachment.mimetype})`);
          console.log(`       Path: ${attachment.path}`);
          console.log(`       Size: ${attachment.size} bytes`);
          
          // Check if file exists on disk
          const fileInfo = fileStorage.getFileInfo(attachment.path);
          console.log(`       File exists: ${fileInfo.exists}`);
        });
      } else {
        console.log('  ❌ No attachments found');
      }
      console.log('---\n');
    }

    // Check for recent expenses (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recentExpenses = await Expense.find({
      submissionDate: { $gte: yesterday }
    }).select('expenseNumber title status attachments');
    
    console.log(`\n🕒 Recent Expenses (Last 24 hours): ${recentExpenses.length}`);
    recentExpenses.forEach(expense => {
      console.log(`  - ${expense.expenseNumber}: ${expense.title} (${expense.status})`);
      console.log(`    Attachments: ${expense.attachments ? expense.attachments.length : 0}`);
    });

  } catch (error) {
    console.error('❌ Error checking expenses:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the check
checkAllExpenses(); 