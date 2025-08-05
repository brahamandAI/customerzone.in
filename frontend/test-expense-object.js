// Test expense object structure
console.log('🧪 Testing Expense Object Structure');
console.log('===================================\n');

// Simulate the transformed expense object from Approval.jsx
const mockExpense = {
  id: '688ca38c6b8ea096f2cd7430', // This is the transformed ID
  _id: '688ca38c6b8ea096f2cd7430', // Original MongoDB ID
  expenseNumber: 'EXP-9472',
  title: 'fuel',
  amount: 5001,
  site: 'Test Site',
  category: 'Accommodation',
  submitter: 'Test User',
  date: '2025-08-03',
  description: 'Test expense',
  status: 'pending',
  approvalLevel: 'L3',
  priority: 'medium',
  attachments: 0,
  modifiedAmount: null,
  approvalComments: []
};

console.log('🔍 Mock expense object:', mockExpense);
console.log('🔍 Expense ID (id):', mockExpense.id);
console.log('🔍 Expense ID (_id):', mockExpense._id);
console.log('🔍 Expense amount:', mockExpense.amount);
console.log('🔍 Amount type:', typeof mockExpense.amount);

// Test the validation logic
const expenseId = mockExpense.id || mockExpense._id;
const amount = Number(mockExpense.amount);

console.log('\n✅ Validation results:');
console.log('Expense ID:', expenseId);
console.log('Amount:', amount);
console.log('Is valid:', expenseId && amount > 0);

// Test request data
const requestData = {
  expenseId: expenseId,
  amount: amount,
  currency: 'INR'
};

console.log('\n📤 Request data:', requestData); 