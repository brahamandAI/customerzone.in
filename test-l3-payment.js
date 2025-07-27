// Test script to help test L3 Approver payment functionality
// This script will help you understand the current state of expenses

const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function testL3Approver() {
  try {
    console.log('🔍 Testing L3 Approver Payment Functionality...\n');

    // 1. Check all expenses and their statuses
    console.log('📋 Checking all expenses and their statuses:');
    const allExpensesResponse = await axios.get(`${API_BASE}/expenses/all`);
    const allExpenses = allExpensesResponse.data.data;
    
    console.log(`Total expenses found: ${allExpenses.length}`);
    
    // Group expenses by status
    const expensesByStatus = {};
    allExpenses.forEach(expense => {
      const status = expense.status || 'unknown';
      if (!expensesByStatus[status]) {
        expensesByStatus[status] = [];
      }
      expensesByStatus[status].push({
        id: expense._id,
        expenseNumber: expense.expenseNumber,
        title: expense.title,
        amount: expense.amount,
        status: expense.status
      });
    });

    console.log('\n📊 Expenses by status:');
    Object.keys(expensesByStatus).forEach(status => {
      console.log(`  ${status}: ${expensesByStatus[status].length} expenses`);
      expensesByStatus[status].forEach(expense => {
        console.log(`    - ${expense.expenseNumber}: ${expense.title} (₹${expense.amount})`);
      });
    });

    // 2. Check what L3 Approver should see
    console.log('\n🎯 L3 Approver should see expenses with status: approved_l2');
    const l3Expenses = expensesByStatus['approved_l2'] || [];
    console.log(`L3 Approver will see: ${l3Expenses.length} expenses`);
    
    if (l3Expenses.length === 0) {
      console.log('\n⚠️  No expenses with status "approved_l2" found!');
      console.log('💡 To test L3 Approver payment functionality:');
      console.log('   1. Create a new expense as submitter');
      console.log('   2. Approve it as L1 Approver (status: approved_l1)');
      console.log('   3. Approve it as L2 Approver (status: approved_l2)');
      console.log('   4. Then L3 Approver will see it for payment processing');
    } else {
      console.log('\n✅ L3 Approver will see these expenses for payment:');
      l3Expenses.forEach(expense => {
        console.log(`   - ${expense.expenseNumber}: ${expense.title} (₹${expense.amount})`);
      });
    }

    // 3. Check if there are any expenses that could be moved to L3
    console.log('\n🔄 Expenses that could be moved to L3 (approved_l1):');
    const l2Expenses = expensesByStatus['approved_l1'] || [];
    if (l2Expenses.length > 0) {
      console.log(`Found ${l2Expenses.length} expenses ready for L2 approval:`);
      l2Expenses.forEach(expense => {
        console.log(`   - ${expense.expenseNumber}: ${expense.title} (₹${expense.amount})`);
      });
      console.log('   → Approve these as L2 Approver to move them to L3 for payment');
    } else {
      console.log('   No expenses with status "approved_l1" found');
    }

    // 4. Check submitted expenses
    console.log('\n📝 Expenses ready for L1 approval (submitted):');
    const submittedExpenses = expensesByStatus['submitted'] || [];
    if (submittedExpenses.length > 0) {
      console.log(`Found ${submittedExpenses.length} expenses ready for L1 approval:`);
      submittedExpenses.forEach(expense => {
        console.log(`   - ${expense.expenseNumber}: ${expense.title} (₹${expense.amount})`);
      });
      console.log('   → Approve these as L1 Approver to move them to L2');
    } else {
      console.log('   No expenses with status "submitted" found');
    }

    console.log('\n🎯 Summary for L3 Approver Testing:');
    console.log(`   - Total expenses: ${allExpenses.length}`);
    console.log(`   - Ready for L3 payment: ${l3Expenses.length}`);
    console.log(`   - Ready for L2 approval: ${l2Expenses.length}`);
    console.log(`   - Ready for L1 approval: ${submittedExpenses.length}`);

    if (l3Expenses.length === 0) {
      console.log('\n💡 To create test data for L3 Approver:');
      console.log('   1. Login as submitter and create new expense');
      console.log('   2. Login as L1 Approver and approve it');
      console.log('   3. Login as L2 Approver and approve it');
      console.log('   4. Login as L3 Approver and you will see payment option');
    }

  } catch (error) {
    console.error('❌ Error testing L3 Approver:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testL3Approver(); 