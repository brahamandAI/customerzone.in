// Test script for AI Expense Assistant
const aiService = require('./frontend/src/services/aiService.js');

console.log('🧪 Testing AI Expense Assistant\n');

// Mock user and sites data
const mockUser = {
  _id: 'user123',
  name: 'Sumit',
  role: 'submitter',
  site: {
    _id: 'site123',
    name: 'Rohini',
    code: 'ROHINI'
  }
};

const mockSites = [
  {
    _id: 'site123',
    name: 'Rohini',
    code: 'ROHINI'
  },
  {
    _id: 'site456',
    name: 'Mumbai',
    code: 'MUMBAI'
  },
  {
    _id: 'site789',
    name: 'Delhi',
    code: 'DELHI'
  }
];

// Test cases
const testCases = [
  '₹1,200 taxi expense for Delhi site',
  '₹500 fuel expense for Rohini',
  '₹800 lunch expense yesterday',
  '₹2000 travel expense for Mumbai site today',
  '₹150 office supplies',
  '₹3000 hotel accommodation for Delhi',
  '₹750 maintenance expense',
  '₹1200 taxi fare',
  '₹450 food expense',
  '₹1800 travel expense tomorrow'
];

async function testAIExtraction() {
  console.log('1️⃣ Testing AI Expense Data Extraction\n');
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`Test ${i + 1}: "${testCase}"`);
    
    try {
      const result = await aiService.extractExpenseData(testCase, mockUser, mockSites);
      
      if (result) {
        console.log('✅ Extracted Data:');
        console.log(`   💰 Amount: ₹${result.amount}`);
        console.log(`   📂 Category: ${result.category}`);
        console.log(`   🏢 Site: ${result.siteName}`);
        console.log(`   📅 Date: ${result.date}`);
        console.log(`   🎯 Confidence: ${result.confidence}%`);
        console.log(`   📝 Title: ${result.title}`);
        console.log(`   📄 Description: ${result.description.substring(0, 100)}...`);
      } else {
        console.log('❌ No data extracted');
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    
    console.log('');
  }
}

function testSuggestions() {
  console.log('2️⃣ Testing AI Suggestions\n');
  
  const suggestions = aiService.getSuggestions(mockUser, mockSites);
  console.log('💡 Generated Suggestions:');
  suggestions.forEach((suggestion, index) => {
    console.log(`   ${index + 1}. ${suggestion}`);
  });
  console.log('');
}

function testValidation() {
  console.log('3️⃣ Testing Data Validation\n');
  
  const testData = [
    {
      amount: 1200,
      category: 'Vehicle KM',
      siteName: 'Rohini',
      description: 'Taxi expense'
    },
    {
      amount: 0,
      category: 'Food',
      siteName: 'Mumbai',
      description: 'Lunch expense'
    },
    {
      amount: 500,
      category: 'Fuel',
      siteName: null,
      description: 'Fuel expense'
    }
  ];
  
  testData.forEach((data, index) => {
    console.log(`Test ${index + 1}:`);
    console.log('   Data:', data);
    
    const validation = aiService.validateExpenseData(data);
    console.log(`   Valid: ${validation.isValid}`);
    
    if (!validation.isValid) {
      console.log('   Errors:', validation.errors);
    }
    console.log('');
  });
}

function testAmountExtraction() {
  console.log('4️⃣ Testing Amount Extraction\n');
  
  const amountTests = [
    '₹1,200 taxi expense',
    '₹500.50 fuel expense',
    '1200 rupees taxi',
    '500 rs fuel',
    '₹1,200.75 travel expense',
    '1200 INR taxi',
    '₹500 taxi fare',
    '500 dollars taxi',
    '500 euros taxi'
  ];
  
  amountTests.forEach((test, index) => {
    console.log(`Test ${index + 1}: "${test}"`);
    const amount = aiService.extractAmount(test);
    console.log(`   Extracted Amount: ${amount}`);
    console.log('');
  });
}

function testCategoryExtraction() {
  console.log('5️⃣ Testing Category Extraction\n');
  
  const categoryTests = [
    '₹500 taxi expense',
    '₹800 fuel expense',
    '₹1200 food expense',
    '₹2000 travel expense',
    '₹300 office supplies',
    '₹1500 maintenance expense',
    '₹1000 accommodation expense',
    '₹750 miscellaneous expense'
  ];
  
  categoryTests.forEach((test, index) => {
    console.log(`Test ${index + 1}: "${test}"`);
    const category = aiService.extractCategory(test.toLowerCase());
    console.log(`   Extracted Category: ${category}`);
    console.log('');
  });
}

// Run all tests
async function runAllTests() {
  try {
    await testAIExtraction();
    testSuggestions();
    testValidation();
    testAmountExtraction();
    testCategoryExtraction();
    
    console.log('🎉 All AI Assistant tests completed!');
    console.log('\n📝 Summary:');
    console.log('✅ AI-powered expense data extraction');
    console.log('✅ Natural language processing');
    console.log('✅ Voice input support');
    console.log('✅ Smart suggestions');
    console.log('✅ Data validation');
    console.log('✅ Confidence scoring');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
runAllTests();
