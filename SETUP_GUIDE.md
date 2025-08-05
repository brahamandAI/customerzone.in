# 🚀 Quick Setup Guide

## **What is this project?**

This is the **Rakshak Expense Management System** - a comprehensive full-stack expense management application built for Rakshak Securitas. It handles:

- **Multi-level approval workflow** (L1, L2, L3 approvers)
- **Role-based access control** (Submitter, Approvers, Admin)
- **Budget management** with site-wise allocation
- **Vehicle KM tracking** with limit enforcement
- **Real-time budget alerts**
- **Comprehensive reporting and analytics**
- **File upload and receipt management**
- **Payment integration** (Razorpay - optional)

## **How to run this project:**

### **Step 1: Install Dependencies**
```bash
npm run install-all
```

### **Step 2: Set up Environment Variables**

**Backend Environment Variables:**
Create a `.env` file in the `backend/` directory with the following content:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/rakshak-expense

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Google OAuth (for Google Sign-In)
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Razorpay (for payment features)
RAZORPAY_KEY_ID=your-razorpay-key-id-here
RAZORPAY_KEY_SECRET=your-razorpay-key-secret-here
```

**Frontend Environment Variables:**
Create a `.env` file in the `frontend/` directory with the following content:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5001/api

# Google OAuth Configuration  
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here

# Application Configuration
GENERATE_SOURCEMAP=false
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development
```

### **Step 3: Start MongoDB**

Make sure MongoDB is running on your system. If you don't have MongoDB installed:

**Option A: Install MongoDB locally**
- Download from: https://www.mongodb.com/try/download/community
- Start MongoDB service

**Option B: Use MongoDB Atlas (Cloud)**
- Create account at: https://www.mongodb.com/atlas
- Create a cluster and get connection string
- Replace `MONGODB_URI` in `.env` with your Atlas connection string

### **Step 4: Start the Application**

```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5001
- Frontend server on http://localhost:3000

### **Step 5: Access the Application**

Open your browser and go to: http://localhost:3000

## **Default User Roles:**

1. **Submitter** - Submit expenses
2. **L1 Approver** - Regional Manager level approval
3. **L2 Approver** - Admin level approval  
4. **L3 Approver** - Finance level approval (Admin access)

## **Optional Features Setup:**

### **Google OAuth (Google Sign-In)**
1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add the credentials to your `.env` file

### **Razorpay Payments**
1. Create Razorpay account: https://razorpay.com/
2. Get API keys from dashboard
3. Add the keys to your `.env` file

## **🎉 New Features Implemented:**

### **✅ Google Sign-In (OAuth 2.0)**
- **One-click sign-in** with Google account
- **Automatic user creation** with submitter role
- **Profile picture import** from Google account
- **Secure token-based authentication**

### **✅ Razorpay Payment Integration**
- **Secure payment processing** for approved expenses
- **Multiple payment methods**: Cards, UPI, Net Banking, Wallets
- **Real-time payment verification**
- **Payment history tracking**
- **Refund support** for L3 approvers

### **✅ Enhanced Security**
- **JWT-based authentication** with bcrypt password hashing
- **Role-based access control** with granular permissions
- **API rate limiting** and request validation
- **CORS protection** and XSS prevention

## **Troubleshooting:**

### **If you get Razorpay errors:**
- The application will now run without Razorpay configured
- Payment features will be disabled but other features will work
- To enable payments, add Razorpay keys to `.env`

### **If Google Sign-In doesn't work:**
- Verify `REACT_APP_GOOGLE_CLIENT_ID` in frontend `.env`
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in backend `.env`
- Ensure your domain is authorized in Google Cloud Console
- Check browser console for errors

### **If MongoDB connection fails:**
- Make sure MongoDB is running
- Check your connection string in `.env`
- Try using MongoDB Atlas if local setup fails

### **If frontend doesn't connect to backend:**
- Check that backend is running on port 5001
- Verify CORS settings in backend
- Check browser console for errors

## **Development Commands:**

```bash
# Start both servers
npm run dev

# Start backend only
npm run server

# Start frontend only
npm run client

# Install dependencies
npm run install-all

# Build for production
npm run build
```

## **Docker Deployment:**

```bash
docker-compose up --build
```

This will start:
- Frontend on http://localhost:3002
- Backend on http://localhost:5001

---

**The application is now ready to use! 🎉** 