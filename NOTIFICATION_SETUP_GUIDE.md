# 📧📱 Email & SMS Notification Setup Guide

This guide will help you set up email and SMS notifications for the Rakshak Expense Management System.

## 🚀 Quick Setup

### 1. Email Configuration (Gmail)

**Step 1: Enable 2-Factor Authentication**
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password for "Mail"

**Step 2: Configure Environment Variables**
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password_here
EMAIL_FROM=noreply@rakshaksecuritas.com
EMAIL_FROM_NAME=Rakshak Securitas
```

### 2. SMS Configuration (Fast2SMS)

**Step 1: Get Fast2SMS API Key**
1. Visit [Fast2SMS](https://www.fast2sms.com/)
2. Sign up for an account
3. Get your API key from the dashboard
4. Note: Free tier includes limited messages

**Step 2: Configure Environment Variables**
```env
# SMS Configuration
FAST2SMS_API_KEY=your_fast2sms_api_key_here
FAST2SMS_SENDER_ID=RAKSHAK
```

## 🔧 Detailed Configuration

### Email Service Setup

The email service uses **Nodemailer** with Gmail SMTP. Here's what gets sent:

1. **Expense Submission Notifications** - Sent to L1 approvers when expenses are submitted
2. **Status Update Notifications** - Sent to submitters when expenses are approved/rejected
3. **Budget Alert Notifications** - Sent to site managers when budget thresholds are exceeded

### SMS Service Setup

The SMS service uses **Fast2SMS** API. Features:

- ✅ India-based service
- ✅ Limited free messages available
- ✅ Simple API integration
- ✅ Delivery reports
- ✅ Bulk messaging support

## 🧪 Testing the Notifications

### Test Email Service
```bash
curl -X POST http://localhost:5001/api/test-notifications/test-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "email": "test@example.com",
    "expenseData": {
      "expenseNumber": "EXP-0001",
      "title": "Test Expense",
      "submitter": "Test User",
      "site": "Test Site",
      "amount": 1000,
      "category": "Travel"
    }
  }'
```

### Test SMS Service
```bash
curl -X POST http://localhost:5001/api/test-notifications/test-sms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "phone": "9999999999",
    "expenseData": {
      "expenseNumber": "EXP-0001",
      "title": "Test Expense",
      "submitter": "Test User",
      "site": "Test Site",
      "amount": 1000,
      "category": "Travel"
    }
  }'
```

### Test Service Connections
```bash
curl -X GET http://localhost:5001/api/test-notifications/test-connections \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📋 Notification Types

### 1. Expense Submission Notifications
**Triggered when:** A submitter submits a new expense
**Sent to:** L1 approvers for the site
**Content includes:**
- Expense number and title
- Amount and category
- Submitter name
- Site information
- Direct link to approval page

### 2. Status Update Notifications
**Triggered when:** An expense is approved/rejected
**Sent to:** The expense submitter
**Content includes:**
- Approval/rejection status
- Approver name
- Modified amount (if any)
- Comments from approver

### 3. Budget Alert Notifications
**Triggered when:** Site budget utilization exceeds thresholds
**Sent to:** Site managers and L3 approvers
**Content includes:**
- Current budget utilization percentage
- Remaining budget amount
- Monthly spending details

## 🔐 Security Considerations

### Email Security
- ✅ Uses SMTP with TLS encryption
- ✅ App passwords instead of regular passwords
- ✅ Rate limiting on email sending
- ✅ Error handling and logging

### SMS Security
- ✅ API key authentication
- ✅ Message validation
- ✅ Delivery status tracking
- ✅ Error handling and logging

## 🛠️ Troubleshooting

### Email Issues

**Problem: "Authentication failed"**
```bash
# Solution: Check your Gmail app password
# 1. Go to Google Account settings
# 2. Security > 2-Step Verification > App passwords
# 3. Generate new app password for "Mail"
```

**Problem: "Connection timeout"**
```bash
# Solution: Check firewall settings
# Ensure port 587 is open for outbound connections
```

### SMS Issues

**Problem: "Invalid API key"**
```bash
# Solution: Verify Fast2SMS API key
# 1. Check your Fast2SMS dashboard
# 2. Ensure API key is correct
# 3. Check account balance
```

**Problem: "Message not delivered"**
```bash
# Solution: Check phone number format
# Ensure number is in international format: +91XXXXXXXXXX
```

## 📊 Monitoring

### Email Monitoring
- Check server logs for email delivery status
- Monitor SMTP connection errors
- Track email bounce rates

### SMS Monitoring
- Check Fast2SMS dashboard for delivery reports
- Monitor API response codes
- Track message delivery success rates

## 🔄 User Preferences

Users can control their notification preferences:

```javascript
// User notification preferences
preferences: {
  notifications: {
    email: true,    // Enable/disable email notifications
    sms: false,     // Enable/disable SMS notifications
    push: true      // Enable/disable in-app notifications
  }
}
```

## 📝 Environment Variables Reference

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@rakshaksecuritas.com
EMAIL_FROM_NAME=Rakshak Securitas

# SMS Configuration
FAST2SMS_API_KEY=your_fast2sms_api_key
FAST2SMS_SENDER_ID=RAKSHAK

# System Configuration
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## 🎯 Testing Checklist

- [ ] Email service connects successfully
- [ ] SMS service connects successfully
- [ ] Test expense submission notifications
- [ ] Test status update notifications
- [ ] Test budget alert notifications
- [ ] Verify user preference controls
- [ ] Check error handling
- [ ] Monitor delivery rates

## 📞 Support

For issues with:
- **Email setup**: Check Gmail app password and SMTP settings
- **SMS setup**: Contact Fast2SMS support or check API documentation
- **System issues**: Check server logs and environment variables

---

**Note:** The notification system is designed to be fault-tolerant. If email or SMS services fail, the system will continue to function with only in-app notifications. 