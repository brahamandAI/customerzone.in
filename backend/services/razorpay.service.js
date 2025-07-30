const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const razorpayService = {
  // Create a new order
  async createOrder(amount, currency = 'INR', receipt = null) {
    try {
      const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency: currency,
        receipt: receipt || `receipt_${Date.now()}`,
        payment_capture: 1
      };

      const order = await razorpay.orders.create(options);
      return order;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error('Failed to create payment order');
    }
  },

  // Verify payment signature
  verifyPaymentSignature(orderId, paymentId, signature) {
    try {
      const text = `${orderId}|${paymentId}`;
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      return generatedSignature === signature;
    } catch (error) {
      console.error('Error verifying payment signature:', error);
      return false;
    }
  },

  // Get payment details
  async getPaymentDetails(paymentId) {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw new Error('Failed to fetch payment details');
    }
  },

  // Refund payment
  async refundPayment(paymentId, amount = null, reason = 'Expense refund') {
    try {
      const refundOptions = {
        payment_id: paymentId,
        reason: reason
      };

      if (amount) {
        refundOptions.amount = amount * 100; // Convert to paise
      }

      const refund = await razorpay.payments.refund(refundOptions);
      return refund;
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw new Error('Failed to refund payment');
    }
  },

  // Get all payments for a user
  async getUserPayments(userId, limit = 10, skip = 0) {
    try {
      const payments = await razorpay.payments.all({
        count: limit,
        skip: skip,
        // You can add more filters here based on your requirements
      });
      return payments;
    } catch (error) {
      console.error('Error fetching user payments:', error);
      throw new Error('Failed to fetch user payments');
    }
  }
};

module.exports = razorpayService; 