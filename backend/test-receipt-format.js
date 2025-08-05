// Test new receipt format
console.log('🧪 Testing New Receipt Format');
console.log('==============================\n');

const expenseId = '688ca38c6b8ea096f2cd7430';
const timestamp = Date.now();

// Old format (too long)
const oldReceipt = `expense_${expenseId}_${timestamp}`;

// New format (shorter)
const newReceipt = `exp_${expenseId.toString().slice(-8)}_${timestamp.toString().slice(-8)}`;

console.log('📏 Receipt Length Comparison:');
console.log('Old receipt:', oldReceipt);
console.log('Old length:', oldReceipt.length, 'characters');
console.log('New receipt:', newReceipt);
console.log('New length:', newReceipt.length, 'characters');

console.log('\n✅ Validation:');
console.log('Is new receipt <= 40 chars?', newReceipt.length <= 40);
console.log('Is old receipt <= 40 chars?', oldReceipt.length <= 40);

// Test with different expense IDs
console.log('\n🧪 Testing with different expense IDs:');
const testIds = [
  '688ca38c6b8ea096f2cd7430',
  '507f1f77bcf86cd799439011',
  '123456789012345678901234'
];

testIds.forEach(id => {
  const receipt = `exp_${id.toString().slice(-8)}_${timestamp.toString().slice(-8)}`;
  console.log(`ID: ${id} -> Receipt: ${receipt} (${receipt.length} chars)`);
}); 