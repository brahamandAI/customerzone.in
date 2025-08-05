#!/usr/bin/env node

/**
 * Test Script for Email & SMS Notification System
 * 
 * This script tests the notification services without requiring the full server
 */

const emailService = require('./backend/services/emailService');
const smsService = require('./backend/services/smsService');

console.log('🧪 Testing Email & SMS Notification System...\n');

// Test data
const testExpenseData = {
  expenseNumber: 'EXP-0001',
  title: 'Test Vehicle KM Expense',
  submitter: 'John Doe',
  submitterEmail: 'john.doe@example.com',
  site: 'Mumbai Office',
  department: 'IT',
  amount: 2500,
  category: 'Vehicle KM',
  timestamp: new Date()
};

const testApprover = {
  email: 'approver@example.com',
  name: 'Manager Smith',
  phone: '9999999999'
};

async function testEmailService() {
  console.log('📧 Testing Email Service...');
  
  try {
    // Test connection
    const connectionTest = await emailService.testConnection();
    console.log('✅ Email connection test:', connectionTest.message);
    
    // Test expense notification
    const emailResult = await emailService.sendExpenseNotification(testApprover, testExpenseData);
    if (emailResult) {
      console.log('✅ Test email sent successfully to:', testApprover.email);
    } else {
      console.log('❌ Test email failed');
    }
    
    // Test status update
    const statusEmailResult = await emailService.sendExpenseStatusUpdate(testExpenseData, 'approved', 'Manager Smith');
    if (statusEmailResult) {
      console.log('✅ Status update email sent successfully');
    } else {
      console.log('❌ Status update email failed');
    }
    
  } catch (error) {
    console.error('❌ Email service test failed:', error.message);
  }
}

async function testSMSService() {
  console.log('\n📱 Testing SMS Service...');
  
  try {
    // Test connection
    const connectionTest = await smsService.testConnection();
    console.log('✅ SMS connection test:', connectionTest.message);
    
    // Test service status
    const status = smsService.getServiceStatus();
    console.log('📊 SMS service status:', status);
    
    // Test expense notification
    const smsResult = await smsService.sendExpenseNotification(testApprover.phone, testExpenseData);
    if (smsResult) {
      console.log('✅ Test SMS sent successfully to:', testApprover.phone);
    } else {
      console.log('❌ Test SMS failed');
    }
    
    // Test status update
    const statusSMSResult = await smsService.sendExpenseStatusUpdate(testApprover.phone, testExpenseData, 'approved', 'Manager Smith');
    if (statusSMSResult) {
      console.log('✅ Status update SMS sent successfully');
    } else {
      console.log('❌ Status update SMS failed');
    }
    
  } catch (error) {
    console.error('❌ SMS service test failed:', error.message);
  }
}

async function testBudgetAlert() {
  console.log('\n💰 Testing Budget Alert Notifications...');
  
  try {
    const siteData = {
      siteName: 'Mumbai Office',
      managerEmail: 'manager@example.com',
      currentMonthExpenses: 45000,
      monthlyBudget: 50000,
      remainingBudget: 5000
    };
    
    const budgetUtilization = 90;
    
    // Test email budget alert
    const emailAlertResult = await emailService.sendBudgetAlert(siteData, budgetUtilization);
    if (emailAlertResult) {
      console.log('✅ Budget alert email sent successfully');
    } else {
      console.log('❌ Budget alert email failed');
    }
    
    // Test SMS budget alert
    const smsAlertResult = await smsService.sendBudgetAlert(testApprover.phone, siteData, budgetUtilization);
    if (smsAlertResult) {
      console.log('✅ Budget alert SMS sent successfully');
    } else {
      console.log('❌ Budget alert SMS failed');
    }
    
  } catch (error) {
    console.error('❌ Budget alert test failed:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting notification system tests...\n');
  
  await testEmailService();
  await testSMSService();
  await testBudgetAlert();
  
  console.log('\n✅ All tests completed!');
  console.log('\n📋 Summary:');
  console.log('- Email service: Check logs above');
  console.log('- SMS service: Check logs above');
  console.log('- Budget alerts: Check logs above');
  console.log('\n💡 To test with real data:');
  console.log('1. Configure your .env file with real credentials');
  console.log('2. Run: npm run dev');
  console.log('3. Submit a test expense');
  console.log('4. Check email and SMS delivery');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testEmailService,
  testSMSService,
  testBudgetAlert,
  runAllTests
}; 