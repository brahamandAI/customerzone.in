const mongoose = require('mongoose');
require('dotenv').config();

// Import all models
require('./models/User');
require('./models/Site');
require('./models/Expense');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    // Get Expense model
    const Expense = require('./models/Expense');
    
    console.log('\n🔍 Checking Expense Numbers...\n');
    
    // Find all expenses
    const expenses = await Expense.find({ isActive: true, isDeleted: false })
      .populate('submittedBy', 'name email')
      .populate('site', 'name code')
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`📊 Found ${expenses.length} recent expenses:\n`);
    
    expenses.forEach((expense, index) => {
      console.log(`${index + 1}. Expense Number: ${expense.expenseNumber}`);
      console.log(`   Title: ${expense.title}`);
      console.log(`   Amount: ₹${expense.amount.toLocaleString()}`);
      console.log(`   Status: ${expense.status}`);
      console.log(`   Submitted By: ${expense.submittedBy?.name || 'Unknown'}`);
      console.log(`   Site: ${expense.site?.name || 'Unknown'}`);
      console.log(`   Created: ${expense.createdAt.toLocaleDateString()}`);
      
      // Check if expense number is in correct format
      const isValidFormat = /^EXP-\d{4}$/.test(expense.expenseNumber);
      console.log(`   Format Valid: ${isValidFormat ? '✅' : '❌'}`);
      console.log('');
    });
    
    // Check for any expenses with incorrect format
    const invalidExpenses = expenses.filter(expense => !/^EXP-\d{4}$/.test(expense.expenseNumber));
    
    if (invalidExpenses.length > 0) {
      console.log('❌ Found expenses with incorrect format:');
      invalidExpenses.forEach(expense => {
        console.log(`   - ${expense.expenseNumber} (${expense.title})`);
      });
    } else {
      console.log('✅ All expense numbers are in correct format!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}); 