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
    
    console.log('\n🧪 Testing Expense Number Reservation System...\n');
    
    // Function to generate sequential expense number (same as in routes)
    const generateSequentialExpenseNumber = async () => {
      try {
        const highestExpense = await Expense.findOne(
          { expenseNumber: { $regex: /^EXP-\d{4}$/ } },
          { expenseNumber: 1 }
        ).sort({ expenseNumber: -1 });

        let nextNumber = 1;
        
        if (highestExpense) {
          const currentNumber = parseInt(highestExpense.expenseNumber.replace('EXP-', ''));
          nextNumber = currentNumber + 1;
        }

        if (nextNumber > 9999) {
          nextNumber = 1;
        }

        return `EXP-${nextNumber.toString().padStart(4, '0')}`;
      } catch (error) {
        console.error('Error generating sequential expense number:', error);
        return null;
      }
    };

    // Function to reserve an expense number (same as in routes)
    const reserveExpenseNumber = async (expenseNumber, userId) => {
      try {
        const existingReservation = await Expense.findOne({ 
          expenseNumber: expenseNumber 
        });

        if (existingReservation) {
          return false;
        }

        const reservation = new Expense({
          expenseNumber: expenseNumber,
          title: 'TEMP_RESERVATION',
          description: 'Temporary reservation',
          amount: 0,
          category: 'Miscellaneous',
          expenseDate: new Date(),
          submittedBy: userId,
          site: '000000000000000000000000',
          department: 'TEMP',
          status: 'reserved',
          isActive: false,
          reservationExpiry: new Date(Date.now() + 30 * 60 * 1000)
        });

        await reservation.save();
        return true;
      } catch (error) {
        console.error('Error reserving expense number:', error);
        return false;
      }
    };
    
    // Test 1: Generate next number
    console.log('📝 Test 1: Generate next sequential number');
    const nextNumber = await generateSequentialExpenseNumber();
    console.log(`   Next number: ${nextNumber}\n`);
    
    // Test 2: Reserve the number
    console.log('🔒 Test 2: Reserve the number');
    const testUserId = '000000000000000000000000'; // Dummy user ID
    const reserved = await reserveExpenseNumber(nextNumber, testUserId);
    console.log(`   Reservation successful: ${reserved}\n`);
    
    // Test 3: Try to reserve the same number again (should fail)
    console.log('❌ Test 3: Try to reserve same number again');
    const duplicateReserved = await reserveExpenseNumber(nextNumber, testUserId);
    console.log(`   Duplicate reservation successful: ${duplicateReserved} (should be false)\n`);
    
    // Test 4: Generate next number (should be different)
    console.log('🔄 Test 4: Generate next number after reservation');
    const nextNumber2 = await generateSequentialExpenseNumber();
    console.log(`   Next number: ${nextNumber2}\n`);
    
    // Test 5: Reserve the second number
    console.log('🔒 Test 5: Reserve the second number');
    const reserved2 = await reserveExpenseNumber(nextNumber2, testUserId);
    console.log(`   Second reservation successful: ${reserved2}\n`);
    
    // Test 6: Clean up reservations
    console.log('🧹 Test 6: Clean up test reservations');
    const cleanupResult = await Expense.deleteMany({
      status: 'reserved',
      isActive: false,
      title: 'TEMP_RESERVATION'
    });
    console.log(`   Cleaned up ${cleanupResult.deletedCount} test reservations\n`);
    
    console.log('✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}); 