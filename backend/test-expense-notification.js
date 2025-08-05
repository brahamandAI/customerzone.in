const axios = require('axios');
require('dotenv').config();

// Test configuration
const API_BASE_URL = 'http://localhost:5001/api';
const TEST_USER_EMAIL = 'admin@test.com'; // Replace with actual admin email
const TEST_USER_PASSWORD = 'admin123'; // Replace with actual admin password

async function testExpenseNotification() {
  try {
    console.log('🧪 Testing Expense Notification Flow...\n');

    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    let token;
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD
      });
      token = loginResponse.data.token;
      console.log('✅ Login successful');
    } catch (loginError) {
      console.log('❌ Login failed:', loginError.response?.data?.message || loginError.message);
      console.log('💡 Update TEST_USER_EMAIL and TEST_USER_PASSWORD in the script');
      return;
    }

    // Step 2: Get all users to find approvers
    console.log('\n2️⃣ Getting all users...');
    try {
      const usersResponse = await axios.get(`${API_BASE_URL}/users/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const users = usersResponse.data.data;
      console.log(`✅ Found ${users.length} users`);
      
      // Find L1 approvers
      const l1Approvers = users.filter(user => user.role === 'l1_approver');
      console.log(`📋 Found ${l1Approvers.length} L1 approvers:`);
      l1Approvers.forEach((approver, index) => {
        console.log(`  ${index + 1}. ${approver.name} (${approver.email})`);
      });
      
      if (l1Approvers.length === 0) {
        console.log('❌ No L1 approvers found. Cannot test expense notifications.');
        return;
      }
      
    } catch (usersError) {
      console.log('❌ Failed to get users:', usersError.response?.data?.message || usersError.message);
      return;
    }

    // Step 3: Create a test expense to trigger notifications
    console.log('\n3️⃣ Creating test expense to trigger notifications...');
    try {
      const testExpense = {
        title: '🧪 Test Expense for Email Notification',
        amount: 1000,
        category: 'Travel',
        description: 'This is a test expense to verify email notifications are working.',
        department: 'IT',
        site: 'TEST001', // Replace with actual site code
        date: new Date().toISOString().split('T')[0],
        vehicleKM: 0,
        travelDetails: {
          from: 'Test Location',
          to: 'Test Destination',
          purpose: 'Testing email notifications'
        },
        accommodationDetails: {
          hotelName: '',
          checkIn: '',
          checkOut: '',
          amount: 0
        }
      };

      const expenseResponse = await axios.post(`${API_BASE_URL}/expenses/create`, testExpense, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Test expense created successfully');
      console.log('Expense ID:', expenseResponse.data.data._id);
      console.log('Expense Number:', expenseResponse.data.data.expenseNumber);
      
      console.log('\n📧 Email notifications should have been sent to L1 approvers');
      console.log('📱 SMS notifications should have been sent (if configured)');
      console.log('💡 Check the backend console logs for detailed notification information');
      
    } catch (expenseError) {
      console.log('❌ Failed to create test expense:', expenseError.response?.data?.message || expenseError.message);
      
      if (expenseError.response?.status === 400) {
        console.log('💡 This might be due to missing site or other validation errors');
        console.log('💡 Check the error details above');
      }
    }

    // Step 4: Check notification logs
    console.log('\n4️⃣ Checking notification status...');
    console.log('📋 Check your backend console for logs like:');
    console.log('  - 📧 Sending notifications to L1 approvers...');
    console.log('  - 📧 Sending email to: [approver-email]');
    console.log('  - 📱 Sending SMS to: [approver-phone]');
    console.log('  - ✅ Email notification sent successfully');
    console.log('  - ✅ SMS notification sent successfully');

    console.log('\n🎉 Expense notification testing completed!');
    console.log('\n📋 What to check:');
    console.log('1. Backend console logs for notification details');
    console.log('2. Email inboxes of L1 approvers for notification emails');
    console.log('3. Phone numbers of L1 approvers for SMS messages');
    console.log('4. Check spam folders if emails are not received');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testExpenseNotification(); 