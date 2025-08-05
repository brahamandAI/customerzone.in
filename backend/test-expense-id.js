const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Import Expense model
const Expense = require('./models/Expense');

async function testExpenseId() {
  console.log('🧪 Testing Expense ID: EXP-9472');
  console.log('================================\n');

  try {
    // Find expense by expense number
    const expense = await Expense.findOne({ expenseNumber: 'EXP-9472' });
    
    if (expense) {
      console.log('✅ Expense found!');
      console.log('Expense details:', {
        _id: expense._id,
        expenseNumber: expense.expenseNumber,
        title: expense.title,
        amount: expense.amount,
        status: expense.status,
        submittedBy: expense.submittedBy,
        category: expense.category
      });
    } else {
      console.log('❌ Expense not found with number: EXP-9472');
      
      // Check if there are any expenses in the database
      const totalExpenses = await Expense.countDocuments();
      console.log(`Total expenses in database: ${totalExpenses}`);
      
      if (totalExpenses > 0) {
        // Get a few sample expenses
        const sampleExpenses = await Expense.find().limit(5);
        console.log('Sample expenses:');
        sampleExpenses.forEach(exp => {
          console.log(`- ${exp.expenseNumber}: ${exp.title} (₹${exp.amount})`);
        });
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

testExpenseId(); 