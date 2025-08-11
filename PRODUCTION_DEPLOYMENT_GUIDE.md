# Production Deployment Guide - Forgot Password Functionality

## ✅ **Forgot Password - Works in Both Development & Production**

### **Current Status:**
- ✅ Frontend: Complete with Material-UI dialog
- ✅ Backend: Complete with email service integration
- ✅ API Routes: `/api/auth/forgot-password` and `/api/auth/reset-password/:token`
- ✅ Email Service: Configured with nodemailer

### **How It Works:**

#### **Development Mode:**
1. User clicks "Forgot password?" button
2. Enters email in dialog
3. Backend generates reset token
4. **Email service sends reset link** (if configured)
5. If email fails, token is returned in response (for testing)
6. User can manually copy token and go to `/reset-password/[token]`

#### **Production Mode:**
1. User clicks "Forgot password?" button
2. Enters email in dialog
3. Backend generates reset token
4. **Email service sends reset link via email**
5. User clicks email link and goes to reset password page
6. User sets new password and is redirected to login

### **Environment Variables for Production:**

Add these to your production environment:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Rakshak Expense System

# Frontend URL (for email links)
FRONTEND_URL=https://your-domain.com

# Environment
NODE_ENV=production
```

### **Email Service Setup:**

#### **Gmail Setup:**
1. Enable 2-factor authentication
2. Generate App Password
3. Use App Password in `SMTP_PASSWORD`

#### **Other Email Providers:**
- **Outlook/Hotmail**: Use `smtp-mail.outlook.com`
- **Yahoo**: Use `smtp.mail.yahoo.com`
- **Custom SMTP**: Use your provider's SMTP settings

### **Security Features:**
- ✅ Reset tokens expire in 10 minutes
- ✅ Tokens are hashed in database
- ✅ Tokens can only be used once
- ✅ Email validation
- ✅ Password strength requirements
- ✅ HTTPS required in production

### **Testing in Production:**
1. Deploy with email configuration
2. Test forgot password flow
3. Check email delivery
4. Verify reset link works
5. Confirm password change

### **Troubleshooting:**
- **Email not sending**: Check SMTP credentials
- **Reset link not working**: Verify `FRONTEND_URL` is correct
- **Token expired**: User needs to request new reset
- **Email in spam**: Check email provider settings

### **Backup Plan:**
If email service fails:
- Admin can manually reset passwords
- System logs all reset attempts
- Users can contact support

---

**The forgot password functionality is now production-ready! 🚀**
