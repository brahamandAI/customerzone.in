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
    
    console.log('\n🔍 Testing Sequential Expense Number Generation...\n');
    
    // Function to generate sequential expense number (same as in routes)
    const generateSequentialExpenseNumber = async () => {
      try {
        // Find the highest expense number
        const highestExpense = await Expense.findOne(
          { expenseNumber: { $regex: /^EXP-\d{4}$/ } },
          { expenseNumber: 1 }
        ).sort({ expenseNumber: -1 });

        let nextNumber = 1;
        
        if (highestExpense) {
          // Extract the number from the highest expense number
          const currentNumber = parseInt(highestExpense.expenseNumber.replace('EXP-', ''));
          nextNumber = currentNumber + 1;
        }

        // Ensure the number is within 1-9999 range
        if (nextNumber > 9999) {
          nextNumber = 1; // Reset to 1 if we reach 9999
        }

        // Format as 4-digit string with leading zeros
        return `EXP-${nextNumber.toString().padStart(4, '0')}`;
      } catch (error) {
        console.error('Error generating sequential expense number:', error);
        return null;
      }
    };
    
    // Test the function multiple times
    console.log('🧪 Testing sequential generation:\n');
    
    for (let i = 0; i < 5; i++) {
      const nextNumber = await generateSequentialExpenseNumber();
      console.log(`Test ${i + 1}: ${nextNumber}`);
    }
    
    // Show current highest expense numbers
    console.log('\n📊 Current highest expense numbers:\n');
    const highestExpenses = await Expense.find(
      { expenseNumber: { $regex: /^EXP-\d{4}$/ } }
    )
    .sort({ expenseNumber: -1 })
    .limit(5)
    .select('expenseNumber title');
    
    highestExpenses.forEach((expense, index) => {
      console.log(`${index + 1}. ${expense.expenseNumber} - ${expense.title}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}); 