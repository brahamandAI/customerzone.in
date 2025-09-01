// Test script to reproduce AI Assistant confirmation error
console.log('🧪 Testing AI Assistant Confirmation Error\n');

// Mock the AI Assistant logic
class MockAIAssistant {
  constructor() {
    this.extractedData = null;
    this.messages = [];
    this.isProcessing = false;
  }

  // Mock expense data extraction
  async extractExpenseData(input) {
    console.log('🔍 Mock extractExpenseData called with:', input);
    
    // Simulate the extraction logic
    if (input.toLowerCase().includes('lunch') && input.toLowerCase().includes('gurgaon')) {
      return {
        amount: 800,
        category: 'Food',
        siteName: 'Gurgaon 106',
        date: '2025-08-20',
        confidence: 100
      };
    }
    return null;
  }

  // Mock confirmation logic
  async processExpenseInput(input) {
    this.isProcessing = true;
    this.addMessage('User', input, 'user');
    
    try {
      const lowerInput = input.toLowerCase().trim();
      console.log('🔍 Processing input:', { input, lowerInput, extractedData: !!this.extractedData });
      
      if (lowerInput === 'yes' || lowerInput === 'हाँ' || lowerInput === 'ok') {
        console.log('✅ Confirmation detected, calling handleConfirmExpense');
        if (this.extractedData) {
          try {
            this.handleConfirmExpense();
            console.log('✅ handleConfirmExpense completed successfully');
          } catch (confirmError) {
            console.error('❌ Error in handleConfirmExpense:', confirmError);
            this.addMessage('AI Assistant', 'Sorry, there was an error filling the form. Please try again.', 'ai');
          }
          return;
        } else {
          console.log('❌ No extractedData available for confirmation');
          this.addMessage('AI Assistant', 'No expense data to confirm. Please provide expense details first.', 'ai');
          return;
        }
      }
      
      // Extract expense data
      console.log('🔍 Extracting expense data for input:', input);
      const extractedData = await this.extractExpenseData(input);
      console.log('🔍 Extracted data:', extractedData);
      
      if (extractedData) {
        this.extractedData = extractedData;
        this.addMessage('AI Assistant', `I've extracted the following expense details:\n\n` +
          `💰 Amount: ₹${extractedData.amount}\n` +
          `📂 Category: ${extractedData.category}\n` +
          `🏢 Site: ${extractedData.siteName}\n` +
          `📅 Date: ${extractedData.date}\n` +
          `🎯 Confidence: ✅ High confidence (${extractedData.confidence}%)\n\n` +
          `Would you like me to fill the form with this data?\n\n` +
          `💡 Say "yes", "हाँ", or "ok" to confirm`, 'ai');
      } else {
        this.addMessage('AI Assistant', `I couldn't understand the expense details. Please try again with more specific information.`, 'ai');
      }
    } catch (error) {
      console.error('❌ Error processing expense:', error);
      this.addMessage('AI Assistant', 'Sorry, I encountered an error while processing your expense. Please try again.', 'ai');
    } finally {
      this.isProcessing = false;
    }
  }

  // Mock confirmation handler
  handleConfirmExpense() {
    console.log('🔍 handleConfirmExpense called with:', { 
      extractedData: !!this.extractedData, 
      extractedDataDetails: this.extractedData 
    });
    
    try {
      if (this.extractedData) {
        console.log('✅ Would call onExpenseDataExtracted with data:', this.extractedData);
        // Simulate the callback
        this.simulateFormFill(this.extractedData);
        this.extractedData = null;
        this.addMessage('AI Assistant', '✅ Expense data has been filled in the form! Please review and submit.', 'ai');
        console.log('✅ Form filled successfully');
      } else {
        console.log('❌ No extractedData available');
        this.addMessage('AI Assistant', '❌ No expense data available to fill. Please provide expense details first.', 'ai');
      }
    } catch (error) {
      console.error('❌ Error in handleConfirmExpense:', error);
      this.addMessage('AI Assistant', '❌ Sorry, there was an error filling the form. Please try again.', 'ai');
    }
  }

  // Mock form fill simulation
  simulateFormFill(data) {
    console.log('🎯 Simulating form fill with data:', data);
    // This would normally call the parent component's callback
    return true;
  }

  // Mock message addition
  addMessage(sender, message, type) {
    this.messages.push({ sender, message, type, timestamp: new Date() });
    console.log(`💬 ${sender}: ${message}`);
  }

  // Get last message
  getLastMessage() {
    return this.messages[this.messages.length - 1];
  }
}

// Test the complete flow
async function testCompleteFlow() {
  console.log('🚀 Testing Complete AI Assistant Flow\n');
  
  const ai = new MockAIAssistant();
  
  try {
    // Step 1: User provides expense details
    console.log('📝 Step 1: User provides expense details');
    await ai.processExpenseInput('₹800 lunch expense for Gurgaon 106');
    console.log('✅ Step 1 completed\n');
    
    // Step 2: User confirms with "yes"
    console.log('📝 Step 2: User confirms with "yes"');
    await ai.processExpenseInput('yes');
    console.log('✅ Step 2 completed\n');
    
    // Check results
    console.log('📊 Test Results:');
    console.log(`Total messages: ${ai.messages.length}`);
    console.log(`Last message: ${ai.getLastMessage()?.message}`);
    console.log(`Extracted data after confirmation: ${ai.extractedData ? 'Still exists' : 'Cleared'}`);
    
    // Verify success
    const lastMessage = ai.getLastMessage();
    if (lastMessage && lastMessage.message.includes('✅ Expense data has been filled')) {
      console.log('🎉 SUCCESS: Form filling worked correctly!');
    } else {
      console.log('❌ FAILURE: Form filling did not work as expected');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Test error scenarios
async function testErrorScenarios() {
  console.log('\n🚨 Testing Error Scenarios\n');
  
  const ai = new MockAIAssistant();
  
  try {
    // Test 1: Confirm without data
    console.log('📝 Test 1: Confirm without data');
    await ai.processExpenseInput('yes');
    console.log('✅ Test 1 completed\n');
    
    // Test 2: Invalid input
    console.log('📝 Test 2: Invalid input');
    await ai.processExpenseInput('invalid input');
    console.log('✅ Test 2 completed\n');
    
  } catch (error) {
    console.error('❌ Error scenario test failed:', error);
  }
}

// Run all tests
async function runAllTests() {
  try {
    await testCompleteFlow();
    await testErrorScenarios();
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📝 Summary:');
    console.log('✅ Complete flow testing');
    console.log('✅ Error scenario testing');
    console.log('✅ Confirmation logic testing');
    console.log('✅ Form filling simulation');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Run the tests
runAllTests();
