# 🧪 Feature Testing Guide

## **Google Sign-In Testing**

### **Prerequisites:**
1. Ensure both backend and frontend `.env` files have Google OAuth credentials
2. Make sure your domain is authorized in Google Cloud Console

### **Test Steps:**

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Navigate to login page:** http://localhost:3000/login

3. **Test Google Sign-In:**
   - Click "Sign in with Google" button
   - Select your Google account
   - Grant necessary permissions
   - You should be automatically logged in and redirected to dashboard

4. **Verify user creation:**
   - Check if user was created in MongoDB with Google profile data
   - User should have 'submitter' role by default
   - Profile picture should be imported from Google

### **Expected Results:**
- ✅ Seamless Google authentication
- ✅ Automatic user account creation
- ✅ JWT token generation and storage
- ✅ Redirect to dashboard after successful login

---

## **Razorpay Payment Testing**

### **Prerequisites:**
1. Ensure Razorpay credentials are configured in backend `.env`
2. Have a test L3 Approver account
3. Have an approved expense ready for payment

### **Test Steps:**

1. **Login as L3 Approver:**
   - Email: l3approver@rakshaksecuritas.com
   - Password: l3approver123

2. **Navigate to Approval page**

3. **Find an approved expense and click "Process Payment"**

4. **Test Razorpay integration:**
   - Payment modal should open with expense details
   - Click "Proceed to Payment"
   - Razorpay checkout should open
   - Use test card details:
     - Card: `4111 1111 1111 1111`
     - Expiry: Any future date
     - CVV: Any 3 digits
     - Name: Any name

5. **Verify payment completion:**
   - Payment should be processed successfully
   - Expense status should update to "payment_processed"
   - Payment details should be stored in database

### **Expected Results:**
- ✅ Payment order creation
- ✅ Razorpay checkout integration
- ✅ Secure payment processing
- ✅ Payment verification and status update
- ✅ Real-time notifications

---

## **Full Workflow Testing**

### **Complete Expense to Payment Flow:**

1. **As Submitter:**
   - Sign in with Google or regular credentials
   - Submit a new expense
   - Upload receipt and fill details

2. **As L1 Approver:**
   - Login and review pending expenses
   - Approve the expense

3. **As L2 Approver:**
   - Login and review L1 approved expenses
   - Approve the expense

4. **As L3 Approver:**
   - Login and review L2 approved expenses
   - Approve the expense for final approval
   - Process payment using Razorpay

5. **Verify End-to-End:**
   - Check expense status throughout the workflow
   - Verify notifications are sent at each stage
   - Confirm payment processing works seamlessly

---

## **Security Testing**

### **Authentication Security:**
- ✅ JWT tokens expire correctly
- ✅ Protected routes require authentication
- ✅ Role-based access control works
- ✅ Google OAuth token verification

### **Payment Security:**
- ✅ Payment signature verification
- ✅ Secure API endpoints
- ✅ No sensitive data exposure
- ✅ Rate limiting on payment endpoints

---

## **Error Handling Testing**

### **Test Error Scenarios:**

1. **Google Sign-In Errors:**
   - Cancel Google sign-in process
   - Use invalid/expired tokens
   - Test with unauthorized domains

2. **Payment Errors:**
   - Cancel payment process
   - Use invalid payment details
   - Test network failures during payment

3. **API Errors:**
   - Test with invalid authentication tokens
   - Test rate limiting
   - Test with malformed requests

### **Expected Error Handling:**
- ✅ Graceful error messages
- ✅ No application crashes
- ✅ Proper fallback mechanisms
- ✅ User-friendly error notifications

---

## **Performance Testing**

### **Load Testing:**
- Multiple concurrent Google sign-ins
- Multiple concurrent payment processes
- Large file uploads with expenses
- Heavy dashboard data loading

### **Expected Performance:**
- ✅ Fast Google OAuth response
- ✅ Quick Razorpay checkout loading
- ✅ Efficient database queries
- ✅ Responsive UI interactions

---

## **Browser Compatibility**

### **Test Browsers:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### **Test Features:**
- Google Sign-In popup functionality
- Razorpay checkout modal
- File upload capabilities
- Real-time notifications

---

## **Mobile Responsiveness**

### **Test Devices:**
- iPhone (Safari)
- Android (Chrome)
- Tablet devices

### **Test Features:**
- Google Sign-In button usability
- Payment modal responsiveness
- Touch interactions
- Form submissions

---

## **Troubleshooting Common Issues**

### **Google Sign-In Issues:**
```bash
# Check if Google Client ID is set
echo $REACT_APP_GOOGLE_CLIENT_ID

# Verify backend Google credentials
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET
```

### **Razorpay Issues:**
```bash
# Check if Razorpay keys are set
echo $RAZORPAY_KEY_ID
echo $RAZORPAY_KEY_SECRET

# Test payment service
curl -X POST http://localhost:5001/api/payments/create-order \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"expenseId": "EXPENSE_ID", "amount": 1000}'
```

### **Database Issues:**
```bash
# Check MongoDB connection
mongo --eval "db.adminCommand('ismaster')"

# Verify database collections
mongo rakshak-expense --eval "show collections"
```

---

## **Success Criteria**

### **✅ Google Sign-In:**
- Users can sign in with Google account
- New users are automatically created
- Profile data is imported correctly
- Authentication works seamlessly

### **✅ Razorpay Payments:**
- Payment orders are created successfully
- Checkout integration works smoothly
- Payments are verified securely
- Payment status updates correctly

### **✅ Overall System:**
- All existing features continue to work
- New features integrate seamlessly
- Security is maintained
- Performance is optimized

---

**🎉 Congratulations! Your Rakshak Expense Management System now has:**
- ✅ Google OAuth integration
- ✅ Razorpay payment processing
- ✅ Enhanced security features
- ✅ Improved user experience