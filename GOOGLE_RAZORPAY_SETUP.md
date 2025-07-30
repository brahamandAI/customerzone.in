# Google OAuth & Razorpay Integration Setup Guide

## 🚀 Features Implemented

### 1. Google Sign-In
- **OAuth 2.0 Integration**: Secure Google authentication
- **Auto User Creation**: New users automatically created with submitter role
- **Profile Picture**: Google profile picture automatically imported
- **Email Verification**: Uses Google's verified email status
- **Seamless Login**: One-click sign-in with Google account

### 2. Razorpay Payment Processing
- **Secure Payments**: End-to-end encrypted payment processing
- **Multiple Payment Methods**: Cards, UPI, Net Banking, Digital Wallets
- **Payment Verification**: Server-side signature verification
- **Payment History**: Complete payment tracking and history
- **Refund Support**: Automated refund processing
- **Real-time Updates**: Socket.IO integration for live updates

## 🔧 Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install google-auth-library razorpay
```

### 2. Environment Variables
Create a `.env` file in the backend directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/expense-management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Server Configuration
PORT=5001
NODE_ENV=development

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Razorpay Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id-here
RAZORPAY_KEY_SECRET=your-razorpay-key-secret-here
```

### 3. Google OAuth Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select existing project
3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Add authorized redirect URIs:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
5. **Copy Client ID and Secret** to your `.env` file

### 4. Razorpay Setup

1. **Create Razorpay Account**: https://razorpay.com/
2. **Get API Keys**:
   - Go to Dashboard > Settings > API Keys
   - Generate new key pair
   - Copy Key ID and Key Secret to your `.env` file
3. **Test Mode**: Use test keys for development
4. **Production Mode**: Use live keys for production

## 🎨 Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install @react-oauth/google razorpay
```

### 2. Environment Variables
Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here
```

### 3. Google Sign-In Integration

The Google Sign-In button is already implemented in the Login page. It will:
- Show "Sign in with Google" button
- Handle Google OAuth flow
- Automatically create user account
- Redirect to dashboard after successful login

### 4. Razorpay Integration

The payment modal is integrated into the Approval page for L3 Approvers. It will:
- Show payment details
- Open Razorpay checkout
- Process payment securely
- Update expense status automatically

## 🔄 API Endpoints

### Google OAuth
- `POST /api/auth/google` - Google Sign-In

### Razorpay Payments
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Get payment history
- `POST /api/payments/refund` - Process refund

## 🧪 Testing

### 1. Google Sign-In Test
1. Start the backend and frontend servers
2. Go to login page
3. Click "Sign in with Google"
4. Complete Google OAuth flow
5. Verify user is created and logged in

### 2. Razorpay Payment Test
1. Login as L3 Approver
2. Go to Approval page
3. Click "Process Payment" on an approved expense
4. Complete payment using test card:
   - Card Number: `4111 1111 1111 1111`
   - Expiry: Any future date
   - CVV: Any 3 digits
5. Verify payment is processed and expense status updated

## 🔒 Security Features

### Google OAuth Security
- **Token Verification**: Server-side Google token verification
- **Email Verification**: Uses Google's verified email status
- **Secure Storage**: JWT tokens stored securely
- **Auto Logout**: Automatic logout on token expiry

### Razorpay Security
- **Signature Verification**: Server-side payment signature verification
- **HTTPS Only**: All payment communications over HTTPS
- **PCI Compliance**: Razorpay handles PCI compliance
- **Fraud Protection**: Built-in fraud detection

## 📱 User Experience

### Google Sign-In Flow
1. User clicks "Sign in with Google"
2. Google OAuth popup opens
3. User selects account and grants permissions
4. User is automatically logged in and redirected to dashboard
5. User profile shows Google profile picture

### Payment Flow
1. L3 Approver clicks "Process Payment"
2. Payment modal opens with expense details
3. User clicks "Proceed to Payment"
4. Razorpay checkout opens
5. User completes payment
6. Payment is verified and expense status updated
7. Real-time notification sent to submitter

## 🚨 Troubleshooting

### Common Issues

1. **Google Sign-In Not Working**
   - Check Google Client ID in environment variables
   - Verify authorized origins in Google Cloud Console
   - Check browser console for errors

2. **Razorpay Payment Failing**
   - Verify Razorpay API keys
   - Check payment amount (should be in paise)
   - Verify signature verification

3. **User Not Created**
   - Check MongoDB connection
   - Verify Google token verification
   - Check server logs for errors

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
LOG_LEVEL=debug
```

## 📞 Support

For issues or questions:
1. Check server logs for error messages
2. Verify all environment variables are set correctly
3. Test with sample data first
4. Contact support with specific error messages

## 🔄 Updates

### Recent Changes
- ✅ Google OAuth integration
- ✅ Razorpay payment processing
- ✅ Real-time payment updates
- ✅ Payment history tracking
- ✅ Refund processing
- ✅ Enhanced security features

### Future Enhancements
- 🔄 Multi-factor authentication
- 🔄 Advanced payment analytics
- 🔄 Bulk payment processing
- 🔄 Payment scheduling
- 🔄 Advanced fraud detection 