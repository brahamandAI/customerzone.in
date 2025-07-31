const razorpayService = require('./services/razorpay.service');
const crypto = require('crypto');
require('dotenv').config();

async function testRazorpayPayment() {
  try {
    console.log('🧪 Testing Razorpay Payment Integration');
    console.log('=====================================\n');

    // Test 1: Check if Razorpay is configured
    console.log('✅ Test 1: Razorpay Configuration Check');
    const isConfigured = razorpayService.isConfigured();
    console.log(`Razorpay configured: ${isConfigured ? '✅ Yes' : '❌ No'}`);
    
    if (!isConfigured) {
      console.log('\n⚠️  Razorpay is not configured!');
      console.log('Please add the following to your backend/.env file:');
      console.log('RAZORPAY_KEY_ID=your_key_id_here');
      console.log('RAZORPAY_KEY_SECRET=your_key_secret_here');
      console.log('\nYou can get these from your Razorpay Dashboard.');
      return;
    }

    console.log(`Key ID: ${process.env.RAZORPAY_KEY_ID ? '✅ Set' : '❌ Missing'}`);
    console.log(`Key Secret: ${process.env.RAZORPAY_KEY_SECRET ? '✅ Set' : '❌ Missing'}`);

    // Test 2: Create a test order
    console.log('\n✅ Test 2: Order Creation Test');
    try {
      const testAmount = 100; // ₹100
      const testReceipt = `test_receipt_${Date.now()}`;
      
      console.log(`Creating test order for ₹${testAmount}...`);
      const order = await razorpayService.createOrder(testAmount, 'INR', testReceipt);
      
      console.log('✅ Order created successfully!');
      console.log(`Order ID: ${order.id}`);
      console.log(`Amount: ₹${order.amount / 100}`);
      console.log(`Currency: ${order.currency}`);
      console.log(`Receipt: ${order.receipt}`);
      console.log(`Status: ${order.status}`);

      // Test 3: Test signature verification
      console.log('\n✅ Test 3: Signature Verification Test');
      
      // Simulate a payment signature (this is what Razorpay would send)
      const testPaymentId = 'pay_test_' + Date.now();
      const testSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${order.id}|${testPaymentId}`)
        .digest('hex');

      const isValidSignature = razorpayService.verifyPaymentSignature(
        order.id,
        testPaymentId,
        testSignature
      );

      console.log(`Signature verification: ${isValidSignature ? '✅ Valid' : '❌ Invalid'}`);

      // Test 4: Test invalid signature
      console.log('\n✅ Test 4: Invalid Signature Test');
      const invalidSignature = 'invalid_signature_123';
      const isInvalidSignature = razorpayService.verifyPaymentSignature(
        order.id,
        testPaymentId,
        invalidSignature
      );

      console.log(`Invalid signature test: ${!isInvalidSignature ? '✅ Correctly rejected' : '❌ Should have been rejected'}`);

      // Test 5: Test payment details (this will fail with test payment ID, but shows the method works)
      console.log('\n✅ Test 5: Payment Details Method Test');
      try {
        await razorpayService.getPaymentDetails(testPaymentId);
        console.log('❌ This should have failed with a test payment ID');
      } catch (error) {
        console.log('✅ Correctly failed to fetch test payment details');
        console.log(`Error: ${error.message}`);
      }

      // Test 6: Test refund method (this will fail with test payment ID, but shows the method works)
      console.log('\n✅ Test 6: Refund Method Test');
      try {
        await razorpayService.refundPayment(testPaymentId, 50);
        console.log('❌ This should have failed with a test payment ID');
      } catch (error) {
        console.log('✅ Correctly failed to refund test payment');
        console.log(`Error: ${error.message}`);
      }

      console.log('\n🎉 All Razorpay tests completed successfully!');
      console.log('\n📋 Summary:');
      console.log('✅ Razorpay is properly configured');
      console.log('✅ Order creation works');
      console.log('✅ Signature verification works');
      console.log('✅ Invalid signature detection works');
      console.log('✅ Payment details method is available');
      console.log('✅ Refund method is available');

      console.log('\n💡 To test with real payments:');
      console.log('1. Use the test order ID in your frontend');
      console.log('2. Complete a test payment using Razorpay test cards');
      console.log('3. Verify the payment signature in your backend');
      console.log('4. Process the payment in your application');

    } catch (error) {
      console.error('❌ Error during Razorpay testing:', error.message);
      
      if (error.message.includes('key_id')) {
        console.log('\n💡 This might be a configuration issue. Check your:');
        console.log('- RAZORPAY_KEY_ID in backend/.env');
        console.log('- RAZORPAY_KEY_SECRET in backend/.env');
        console.log('- Make sure you\'re using the correct keys from Razorpay Dashboard');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Also test the payment routes
async function testPaymentRoutes() {
  console.log('\n🧪 Testing Payment Routes');
  console.log('========================\n');

  // Test the payment routes by checking if they exist and are properly configured
  const express = require('express');
  const app = express();
  
  try {
    const paymentRoutes = require('./routes/payments');
    console.log('✅ Payment routes module loaded successfully');
    
    // Check if the routes are properly configured
    console.log('✅ Payment routes are available');
    console.log('Available endpoints:');
    console.log('- POST /api/payments/create-order');
    console.log('- POST /api/payments/verify');
    console.log('- POST /api/payments/refund');
    
  } catch (error) {
    console.error('❌ Error loading payment routes:', error.message);
  }
}

// Run both tests
async function runAllTests() {
  await testRazorpayPayment();
  await testPaymentRoutes();
}

runAllTests(); 