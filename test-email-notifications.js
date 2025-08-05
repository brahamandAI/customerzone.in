const axios = require('axios');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Test configuration
const API_BASE_URL = 'http://localhost:5001/api';
const TEST_USER_EMAIL = 'admin@test.com'; // Replace with actual admin email
const TEST_USER_PASSWORD = 'admin123'; // Replace with actual admin password

// Email configuration from environment
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
};

async function testEmailNotifications() {
  try {
    console.log('🧪 Testing Email Notifications...\n');
    console.log('📧 Email Configuration:');
    console.log('- Host:', EMAIL_CONFIG.host);
    console.log('- Port:', EMAIL_CONFIG.port);
    console.log('- User:', EMAIL_CONFIG.auth.user);
    console.log('- Password:', EMAIL_CONFIG.auth.pass ? '***SET***' : '❌ NOT SET');
    console.log('');

    // Step 1: Test SMTP Connection
    console.log('1️⃣ Testing SMTP Connection...');
    try {
      const transporter = nodemailer.createTransporter(EMAIL_CONFIG);
      await transporter.verify();
      console.log('✅ SMTP connection successful');
    } catch (smtpError) {
      console.log('❌ SMTP connection failed:', smtpError.message);
      console.log('💡 Check your SMTP settings in .env file');
      return;
    }

    // Step 2: Login to API
    console.log('\n2️⃣ Logging in to API...');
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

    // Step 3: Test Email Service Endpoint
    console.log('\n3️⃣ Testing Email Service Endpoint...');
    try {
      const emailTestResponse = await axios.get(`${API_BASE_URL}/test-notifications/test-email`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Email service test successful');
      console.log('Response:', emailTestResponse.data);
    } catch (emailTestError) {
      console.log('❌ Email service test failed:', emailTestError.response?.data?.message || emailTestError.message);
    }

    // Step 4: Test SMS Service Endpoint
    console.log('\n4️⃣ Testing SMS Service Endpoint...');
    try {
      const smsTestResponse = await axios.get(`${API_BASE_URL}/test-notifications/test-sms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ SMS service test successful');
      console.log('Response:', smsTestResponse.data);
    } catch (smsTestError) {
      console.log('❌ SMS service test failed:', smsTestError.response?.data?.message || smsTestError.message);
    }

    // Step 5: Test Connection Status
    console.log('\n5️⃣ Testing Connection Status...');
    try {
      const connectionResponse = await axios.get(`${API_BASE_URL}/test-notifications/test-connections`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Connection test successful');
      console.log('Response:', connectionResponse.data);
    } catch (connectionError) {
      console.log('❌ Connection test failed:', connectionError.response?.data?.message || connectionError.message);
    }

    // Step 6: Send Test Email Directly
    console.log('\n6️⃣ Sending Test Email Directly...');
    try {
      const testEmailResponse = await axios.post(`${API_BASE_URL}/test-notifications/send-test-email`, {
        to: TEST_USER_EMAIL,
        subject: '🧪 Test Email from Rakshak System',
        message: 'This is a test email to verify email notifications are working.'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Test email sent successfully');
      console.log('Response:', testEmailResponse.data);
    } catch (testEmailError) {
      console.log('❌ Test email failed:', testEmailError.response?.data?.message || testEmailError.message);
    }

    // Step 7: Check Environment Variables
    console.log('\n7️⃣ Checking Environment Variables...');
    const requiredEnvVars = [
      'SMTP_HOST',
      'SMTP_PORT', 
      'SMTP_EMAIL',
      'SMTP_PASSWORD',
      'FAST2SMS_API_KEY',
      'FAST2SMS_SENDER_ID'
    ];

    requiredEnvVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`✅ ${varName}: ${varName.includes('PASSWORD') || varName.includes('KEY') ? '***SET***' : value}`);
      } else {
        console.log(`❌ ${varName}: NOT SET`);
      }
    });

    console.log('\n🎉 Email notification testing completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Check your email inbox for test emails');
    console.log('2. Check your phone for SMS messages (if configured)');
    console.log('3. Check backend console logs for detailed information');
    console.log('4. If emails are not received, check spam folder');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testEmailNotifications(); 