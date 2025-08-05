const mongoose = require('mongoose');
const razorpayService = require('./services/razorpay.service');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Import Expense model
const Expense = require('./models/Expense');

async function testSpecificExpense() {
  console.log('🧪 Testing Specific Expense: EXP-9472');
  console.log('=====================================\n');

  try {
    // Find the specific expense
    const expense = await Expense.findOne({ expenseNumber: 'EXP-9472' });
    
    if (!expense) {
      console.log('❌ Expense EXP-9472 not found!');
      return;
    }

    console.log('✅ Expense found!');
    console.log('Expense details:', {
      _id: expense._id,
      expenseNumber: expense.expenseNumber,
      title: expense.title,
      amount: expense.amount,
      status: expense.status
    });

    // Test Razorpay order creation with this expense
    console.log('\n🔍 Testing Razorpay order creation...');
    
    const amount = expense.amount;
    const currency = 'INR';
    const receipt = `expense_${expense._id}_${Date.now()}`;

    console.log('Order parameters:', {
      amount,
      currency,
      receipt
    });

    try {
      const order = await razorpayService.createOrder(amount, currency, receipt);
      
      console.log('✅ Order created successfully!');
      console.log('Order details:', {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status
      });

    } catch (error) {
      console.log('❌ Order creation failed!');
      console.log('Error:', error.message);
      console.log('Full error:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

testSpecificExpense(); 