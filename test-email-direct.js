const nodemailer = require('nodemailer');
require('dotenv').config();

// Email configuration
const emailConfig = {
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

async function testEmailDirect() {
  try {
    console.log('🧪 Testing Email Service Directly...\n');
    
    // Check environment variables
    console.log('📧 Email Configuration:');
    console.log('- SMTP_HOST:', process.env.SMTP_HOST || 'smtp.gmail.com');
    console.log('- SMTP_PORT:', process.env.SMTP_PORT || 587);
    console.log('- SMTP_EMAIL:', process.env.SMTP_EMAIL || '❌ NOT SET');
    console.log('- SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '***SET***' : '❌ NOT SET');
    console.log('');

    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      console.log('❌ Email configuration incomplete!');
      console.log('💡 Please set SMTP_EMAIL and SMTP_PASSWORD in your .env file');
      return;
    }

    // Create transporter
    console.log('1️⃣ Creating email transporter...');
    const transporter = nodemailer.createTransporter(emailConfig);
    
    // Test connection
    console.log('2️⃣ Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful');

    // Send test email
    console.log('3️⃣ Sending test email...');
    const testEmail = {
      from: `"Rakshak Expense System" <${process.env.SMTP_EMAIL}>`,
      to: process.env.SMTP_EMAIL, // Send to yourself for testing
      subject: '🧪 Test Email - Rakshak Expense System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976d2;">🧪 Test Email</h2>
          <p>This is a test email to verify that the email notification system is working correctly.</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>📧 Email Configuration Test</h3>
            <ul>
              <li><strong>SMTP Host:</strong> ${process.env.SMTP_HOST || 'smtp.gmail.com'}</li>
              <li><strong>SMTP Port:</strong> ${process.env.SMTP_PORT || 587}</li>
              <li><strong>From Email:</strong> ${process.env.SMTP_EMAIL}</li>
              <li><strong>Timestamp:</strong> ${new Date().toLocaleString('en-IN')}</li>
            </ul>
          </div>
          
          <p>If you received this email, the notification system is working correctly! 🎉</p>
          
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated test email from Rakshak Expense Management System.
          </p>
        </div>
      `,
      text: `
Test Email - Rakshak Expense System

This is a test email to verify that the email notification system is working correctly.

Email Configuration Test:
- SMTP Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}
- SMTP Port: ${process.env.SMTP_PORT || 587}
- From Email: ${process.env.SMTP_EMAIL}
- Timestamp: ${new Date().toLocaleString('en-IN')}

If you received this email, the notification system is working correctly! 🎉

This is an automated test email from Rakshak Expense Management System.
      `
    };

    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('To:', result.accepted);
    console.log('');

    console.log('📋 Check your email inbox for the test email');
    console.log('📧 Email sent to:', process.env.SMTP_EMAIL);
    console.log('💡 If you don\'t see it, check your spam folder');

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('💡 Authentication failed. Check your email and password.');
      console.log('💡 For Gmail, make sure you\'re using an App Password.');
    } else if (error.code === 'ECONNECTION') {
      console.log('💡 Connection failed. Check your SMTP settings.');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('💡 Connection timed out. Check your internet connection.');
    }
  }
}

// Run the test
testEmailDirect(); 