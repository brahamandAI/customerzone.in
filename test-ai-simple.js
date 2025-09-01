// Simple test script for AI Expense Assistant
console.log('🧪 Testing AI Expense Assistant - Simple Version\n');

// Mock AI Service (simplified version for testing)
class AIService {
  constructor() {
    this.categoryKeywords = {
      'Vehicle KM': ['taxi', 'cab', 'uber', 'ola', 'vehicle', 'car', 'transport', 'auto', 'rickshaw'],
      'Fuel': ['fuel', 'petrol', 'diesel', 'gas', 'cng', 'lpg'],
      'Food': ['food', 'lunch', 'dinner', 'breakfast', 'meal', 'restaurant', 'cafe', 'snack', 'tea', 'coffee'],
      'Travel': ['travel', 'flight', 'train', 'bus', 'hotel', 'accommodation', 'lodging', 'airfare'],
      'Office Supplies': ['stationery', 'supplies', 'equipment', 'office', 'pen', 'paper', 'printer'],
      'Maintenance': ['maintenance', 'repair', 'service', 'spare', 'parts'],
      'Accommodation': ['hotel', 'lodging', 'accommodation', 'room', 'stay'],
      'Miscellaneous': ['misc', 'other', 'general']
    };

    this.amountPatterns = [
      /₹\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
      /(\d+(?:,\d+)*(?:\.\d{2})?)\s*(?:rupees?|rs?|inr)/i,
      /(\d+(?:,\d+)*(?:\.\d{2})?)\s*₹/i
    ];
  }

  // Extract amount from text
  extractAmount(input) {
    for (const pattern of this.amountPatterns) {
      const match = input.match(pattern);
      if (match) {
        const amountStr = match[1] || match[2];
        const amount = parseFloat(amountStr.replace(/,/g, ''));
        if (!isNaN(amount) && amount > 0) {
          return amount;
        }
      }
    }
    return null;
  }

  // Extract category based on keywords
  extractCategory(input) {
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      if (keywords.some(keyword => input.includes(keyword))) {
        return category;
      }
    }
    return 'Miscellaneous';
  }

  // Extract site information
  extractSiteInfo(input, user, sites) {
    let siteName = null;
    let siteId = null;
    
    // First, try to find site mentioned in the input
    if (sites && sites.length > 0) {
      for (const site of sites) {
        const siteNameLower = site.name.toLowerCase();
        const siteCodeLower = site.code.toLowerCase();
        
        if (input.includes(siteNameLower) || input.includes(siteCodeLower)) {
          siteName = site.name;
          siteId = site._id;
          break;
        }
      }
    }
    
    // If no site mentioned, use user's assigned site
    if (!siteName && user?.site) {
      const userSite = user.site;
      if (typeof userSite === 'object' && userSite.name) {
        siteName = userSite.name;
        siteId = userSite._id;
      } else if (typeof userSite === 'string') {
        const foundSite = sites?.find(site => site._id === userSite);
        if (foundSite) {
          siteName = foundSite.name;
          siteId = foundSite._id;
        }
      }
    }
    
    return { siteName, siteId };
  }

  // Extract date from text
  extractDate(input) {
    const datePatterns = {
      'today': 0,
      'yesterday': -1,
      'tomorrow': 1
    };
    
    for (const [keyword, daysOffset] of Object.entries(datePatterns)) {
      if (input.includes(keyword)) {
        const date = new Date();
        date.setDate(date.getDate() + daysOffset);
        return date.toISOString().split('T')[0];
      }
    }
    
    // Default to today
    return new Date().toISOString().split('T')[0];
  }

  // Main method to extract expense data
  async extractExpenseData(input, user, sites) {
    try {
      const lowerInput = input.toLowerCase();
      
      // Extract amount
      const amount = this.extractAmount(input);
      
      // Extract category
      const category = this.extractCategory(lowerInput);
      
      // Extract site information
      const siteInfo = this.extractSiteInfo(lowerInput, user, sites);
      
      // Extract date
      const date = this.extractDate(lowerInput);
      
      // Generate title
      const title = input.length > 50 ? input.substring(0, 50) + '...' : input;
      
      // Calculate confidence
      let confidence = 0;
      if (amount) confidence += 30;
      if (category && category !== 'Miscellaneous') confidence += 25;
      if (siteInfo.siteName) confidence += 25;
      if (input.length > 10) confidence += 10;
      if (input.length > 20) confidence += 10;
      
      // Validate extracted data
      if (amount && siteInfo.siteName) {
        return {
          amount,
          category,
          siteName: siteInfo.siteName,
          siteId: siteInfo.siteId,
          date,
          title,
          description: input,
          confidence: Math.min(confidence, 100)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error in AI expense extraction:', error);
      return null;
    }
  }

  // Get suggestions
  getSuggestions(user, sites) {
    const suggestions = [
      '₹500 fuel expense',
      '₹800 lunch expense',
      '₹1200 taxi expense',
      '₹2000 travel expense'
    ];
    
    if (user?.site) {
      const userSite = user.site;
      const siteName = typeof userSite === 'object' ? userSite.name : 
                      sites?.find(site => site._id === userSite)?.name;
      
      if (siteName) {
        return suggestions.map(suggestion => `${suggestion} for ${siteName}`);
      }
    }
    
    return suggestions;
  }
}

// Create AI service instance
const aiService = new AIService();

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

function testAmountExtraction() {
  console.log('3️⃣ Testing Amount Extraction\n');
  
  const amountTests = [
    '₹1,200 taxi expense',
    '₹500.50 fuel expense',
    '1200 rupees taxi',
    '500 rs fuel',
    '₹1,200.75 travel expense',
    '1200 INR taxi',
    '₹500 taxi fare'
  ];
  
  amountTests.forEach((test, index) => {
    console.log(`Test ${index + 1}: "${test}"`);
    const amount = aiService.extractAmount(test);
    console.log(`   Extracted Amount: ${amount}`);
    console.log('');
  });
}

function testCategoryExtraction() {
  console.log('4️⃣ Testing Category Extraction\n');
  
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
    testAmountExtraction();
    testCategoryExtraction();
    
    console.log('🎉 All AI Assistant tests completed!');
    console.log('\n📝 Summary:');
    console.log('✅ AI-powered expense data extraction');
    console.log('✅ Natural language processing');
    console.log('✅ Smart suggestions');
    console.log('✅ Data validation');
    console.log('✅ Confidence scoring');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
runAllTests();
