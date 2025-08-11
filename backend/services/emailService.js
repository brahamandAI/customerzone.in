const nodemailer = require('nodemailer');
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
              this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error);
      this.transporter = null;
    }
  }

  async sendExpenseNotification(approver, expenseData) {
    if (!this.transporter) {
      console.error('❌ Email transporter not initialized');
      return false;
    }

    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Rakshak Expense System'}" <${process.env.EMAIL_FROM || process.env.SMTP_EMAIL}>`,
        to: approver.email,
        subject: `🔔 New Expense Approval Required - ${expenseData.expenseNumber}`,
        html: this.generateExpenseNotificationHTML(expenseData),
        text: this.generateExpenseNotificationText(expenseData)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email notification sent successfully to:', approver.email);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email notification:', error);
      return false;
    }
  }

  async sendExpenseStatusUpdate(expenseData, action, approverName) {
    if (!this.transporter) {
      console.error('❌ Email transporter not initialized');
      return false;
    }

    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Rakshak Expense System'}" <${process.env.EMAIL_FROM || process.env.SMTP_EMAIL}>`,
        to: expenseData.submitterEmail,
        subject: `📋 Expense ${action} - ${expenseData.expenseNumber}`,
        html: this.generateStatusUpdateHTML(expenseData, action, approverName),
        text: this.generateStatusUpdateText(expenseData, action, approverName)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Status update email sent successfully to:', expenseData.submitterEmail);
      return true;
    } catch (error) {
      console.error('❌ Failed to send status update email:', error);
      return false;
    }
  }

  async sendBudgetAlert(siteData, budgetUtilization) {
    if (!this.transporter) {
      console.error('❌ Email transporter not initialized');
      return false;
    }

    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Rakshak Expense System'}" <${process.env.EMAIL_FROM || process.env.SMTP_EMAIL}>`,
        to: siteData.managerEmail,
        subject: `⚠️ Budget Alert - ${siteData.siteName}`,
        html: this.generateBudgetAlertHTML(siteData, budgetUtilization),
        text: this.generateBudgetAlertText(siteData, budgetUtilization)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Budget alert email sent successfully to:', siteData.managerEmail);
      return true;
    } catch (error) {
      console.error('❌ Failed to send budget alert email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(userEmail, resetToken) {
    if (!this.transporter) {
      console.error('❌ Email transporter not initialized');
      return false;
    }

    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
      
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Rakshak Expense System'}" <${process.env.EMAIL_FROM || process.env.SMTP_EMAIL}>`,
        to: userEmail,
        subject: '🔐 Password Reset Request - Rakshak Expense System',
        html: this.generatePasswordResetHTML(resetUrl),
        text: this.generatePasswordResetText(resetUrl)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent successfully to:', userEmail);
      return true;
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      return false;
    }
  }

  generateExpenseNotificationHTML(expenseData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Expense Approval Required</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1976d2; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .expense-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #1976d2; }
          .button { display: inline-block; padding: 10px 20px; background: #1976d2; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New Expense Approval Required</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>A new expense has been submitted and requires your approval.</p>
            
            <div class="expense-details">
              <h3>Expense Details:</h3>
              <p><strong>Expense Number:</strong> ${expenseData.expenseNumber}</p>
              <p><strong>Title:</strong> ${expenseData.title}</p>
              <p><strong>Submitter:</strong> ${expenseData.submitter}</p>
              <p><strong>Amount:</strong> ₹${expenseData.amount}</p>
              <p><strong>Category:</strong> ${expenseData.category}</p>
              <p><strong>Site:</strong> ${expenseData.site}</p>
              <p><strong>Department:</strong> ${expenseData.department}</p>
              <p><strong>Submitted Date:</strong> ${new Date(expenseData.timestamp).toLocaleString('en-IN')}</p>
            </div>
            
            <p>Please log in to the system to review and approve/reject this expense.</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/approval" class="button">Review Expense</a>
            </p>
            
            <p>If you have any questions, please contact the system administrator.</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from Rakshak Expense Management System.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateExpenseNotificationText(expenseData) {
    return `
New Expense Approval Required

A new expense has been submitted and requires your approval.

Expense Details:
- Expense Number: ${expenseData.expenseNumber}
- Title: ${expenseData.title}
- Submitter: ${expenseData.submitter}
- Amount: ₹${expenseData.amount}
- Category: ${expenseData.category}
- Site: ${expenseData.site}
- Department: ${expenseData.department}
- Submitted Date: ${new Date(expenseData.timestamp).toLocaleString('en-IN')}

Please log in to the system to review and approve/reject this expense.

Login URL: ${process.env.FRONTEND_URL}/approval

This is an automated notification from Rakshak Expense Management System.
Please do not reply to this email.
    `;
  }

  generateStatusUpdateHTML(expenseData, action, approverName) {
    const actionColor = action === 'approved' ? '#4caf50' : '#f44336';
    const actionIcon = action === 'approved' ? '✅' : '❌';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Expense ${action}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${actionColor}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .expense-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid ${actionColor}; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${actionIcon} Expense ${action.charAt(0).toUpperCase() + action.slice(1)}</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Your expense has been <strong>${action}</strong> by ${approverName}.</p>
            
            <div class="expense-details">
              <h3>Expense Details:</h3>
              <p><strong>Expense Number:</strong> ${expenseData.expenseNumber}</p>
              <p><strong>Title:</strong> ${expenseData.title}</p>
              <p><strong>Amount:</strong> ₹${expenseData.amount}</p>
              <p><strong>Category:</strong> ${expenseData.category}</p>
              <p><strong>Site:</strong> ${expenseData.site}</p>
              <p><strong>Status:</strong> ${action.charAt(0).toUpperCase() + action.slice(1)}</p>
              <p><strong>Processed Date:</strong> ${new Date().toLocaleString('en-IN')}</p>
            </div>
            
            <p>You can view the complete details in your dashboard.</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from Rakshak Expense Management System.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateStatusUpdateText(expenseData, action, approverName) {
    return `
Expense ${action.charAt(0).toUpperCase() + action.slice(1)}

Your expense has been ${action} by ${approverName}.

Expense Details:
- Expense Number: ${expenseData.expenseNumber}
- Title: ${expenseData.title}
- Amount: ₹${expenseData.amount}
- Category: ${expenseData.category}
- Site: ${expenseData.site}
- Status: ${action.charAt(0).toUpperCase() + action.slice(1)}
- Processed Date: ${new Date().toLocaleString('en-IN')}

You can view the complete details in your dashboard.

This is an automated notification from Rakshak Expense Management System.
Please do not reply to this email.
    `;
  }

  generateBudgetAlertHTML(siteData, budgetUtilization) {
    const alertColor = budgetUtilization >= 95 ? '#f44336' : '#ff9800';
    const alertIcon = budgetUtilization >= 95 ? '🚨' : '⚠️';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Budget Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${alertColor}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .alert-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid ${alertColor}; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${alertIcon} Budget Alert</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>A budget alert has been triggered for your site.</p>
            
            <div class="alert-details">
              <h3>Budget Details:</h3>
              <p><strong>Site:</strong> ${siteData.siteName}</p>
              <p><strong>Budget Utilization:</strong> ${budgetUtilization}%</p>
              <p><strong>Current Month Expenses:</strong> ₹${siteData.currentMonthExpenses}</p>
              <p><strong>Monthly Budget:</strong> ₹${siteData.monthlyBudget}</p>
              <p><strong>Remaining Budget:</strong> ₹${siteData.remainingBudget}</p>
            </div>
            
            <p>Please review your site's expenses and budget allocation.</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from Rakshak Expense Management System.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateBudgetAlertText(siteData, budgetUtilization) {
    return `
Budget Alert

A budget alert has been triggered for your site.

Budget Details:
- Site: ${siteData.siteName}
- Budget Utilization: ${budgetUtilization}%
- Current Month Expenses: ₹${siteData.currentMonthExpenses}
- Monthly Budget: ₹${siteData.monthlyBudget}
- Remaining Budget: ₹${siteData.remainingBudget}

Please review your site's expenses and budget allocation.

This is an automated notification from Rakshak Expense Management System.
Please do not reply to this email.
    `;
  }

  generatePasswordResetHTML(resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #008080; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #008080; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset your password for the Rakshak Expense Management System.</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #008080;">${resetUrl}</p>
            
            <div class="warning">
              <p><strong>⚠️ Important:</strong></p>
              <ul>
                <li>This link will expire in 10 minutes</li>
                <li>If you didn't request this password reset, please ignore this email</li>
                <li>For security reasons, this link can only be used once</li>
              </ul>
            </div>
            
            <p>If you have any questions, please contact your system administrator.</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from Rakshak Expense Management System.</p>
            <p>Please do not reply to this email.</p>
            <p>© 2025 Rakshak Securitas. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generatePasswordResetText(resetUrl) {
    return `
Password Reset Request

We received a request to reset your password for the Rakshak Expense Management System.

To reset your password, please click the following link:
${resetUrl}

Important:
- This link will expire in 10 minutes
- If you didn't request this password reset, please ignore this email
- For security reasons, this link can only be used once

If you have any questions, please contact your system administrator.

This is an automated notification from Rakshak Expense Management System.
Please do not reply to this email.

© 2025 Rakshak Securitas. All rights reserved.
    `;
  }

  async testConnection() {
    if (!this.transporter) {
      return { success: false, message: 'Email transporter not initialized' };
    }

    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service is working correctly' };
    } catch (error) {
      return { success: false, message: `Email service test failed: ${error.message}` };
    }
  }
}

module.exports = new EmailService(); 