const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');
const Expense = require('../models/Expense');
const User = require('../models/User');
const Site = require('../models/Site');
const ApprovalHistory = require('../models/ApprovalHistory');
const PendingApprover = require('../models/PendingApprovers');
const Comment = require('../models/Comments');

// File upload route
router.post('/upload', protect, authorize('submitter', 'l1_approver', 'l2_approver', 'l3_approver'), async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const file = req.files.file;
    const uploadDir = path.join(__dirname, '..', 'uploads', 'expenses');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.name);
    const filepath = path.join(uploadDir, filename);

    // Move file to upload directory
    await file.mv(filepath);

    const fileData = {
      filename: filename,
      originalName: file.name,
      path: 'uploads/expenses/' + filename,
      size: file.size,
      mimetype: file.mimetype
    };

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: fileData
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
});

// Create new expense
router.post('/create', protect, authorize('submitter', 'l1_approver', 'l2_approver', 'l3_approver'), async (req, res) => {
  try {
    const {
      expenseNumber,
      title,
      description,
      amount,
      currency,
      category,
      subcategory,
      expenseDate,
      submittedById,
      siteId,
      department,
      vehicleKm,
      travel,
      accommodation,
      attachments
    } = req.body;

    // Validate required fields
    if (!expenseNumber || !title || !amount || !category || !expenseDate || !submittedById || !siteId || !department) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided' 
      });
    }

    // Check for duplicate expense number
    const existingExpense = await Expense.findOne({ expenseNumber });

    if (existingExpense) {
      return res.status(400).json({
        success: false,
        message: 'This expense number already exists. Please use a different number.'
      });
    }

    // Create new expense with Mongoose
    const newExpense = new Expense({
        expenseNumber,
        title,
        description,
        amount: parseFloat(amount),
        currency: currency || 'INR',
        category,
        subcategory,
        expenseDate: new Date(expenseDate),
        submissionDate: new Date(),
      submittedBy: submittedById,
      site: siteId,
        department,
        vehicleKm: vehicleKm ? {
          startKm: vehicleKm.startKm,
          endKm: vehicleKm.endKm,
          totalKm: vehicleKm.totalKm,
          vehicleNumber: vehicleKm.vehicleNumber,
          purpose: vehicleKm.purpose,
          route: vehicleKm.route,
          ratePerKm: vehicleKm.ratePerKm || 10,
          exceedsLimit: vehicleKm.exceedsLimit || false,
          exceedReason: vehicleKm.exceedReason
        } : undefined,
        travel: travel ? {
          from: travel.from,
          to: travel.to,
          travelDate: travel.travelDate ? new Date(travel.travelDate) : null,
          returnDate: travel.returnDate ? new Date(travel.returnDate) : null,
          mode: travel.mode,
          bookingReference: travel.bookingReference,
          passengerName: travel.passengerName
        } : undefined,
        accommodation: accommodation ? {
          hotelName: accommodation.hotelName,
          checkIn: accommodation.checkIn ? new Date(accommodation.checkIn) : null,
          checkOut: accommodation.checkOut ? new Date(accommodation.checkOut) : null,
          location: accommodation.location,
          roomType: accommodation.roomType,
          guestName: accommodation.guestName,
          bookingReference: accommodation.bookingReference
        } : undefined,
        attachments: attachments || [],
      status: 'submitted',
      reimbursement: {
        // If bankDetails is provided in req.body, use it; otherwise, fetch from user profile
        bankDetails: req.body.bankDetails || undefined
      }
    });

    // If bankDetails not provided, fetch from user profile and set
    if (!req.body.bankDetails) {
      const submitter = await User.findById(submittedById);
      if (submitter && submitter.bankDetails) {
        newExpense.reimbursement.bankDetails = submitter.bankDetails;
          }
    }

    await newExpense.save();

    // Assign L1 approvers for the site
    const l1Approvers = await User.find({ role: 'l1_approver', site: siteId, isActive: true });
    for (const approver of l1Approvers) {
      await PendingApprover.create({
        level: 1,
        approver: approver._id,
        expense: newExpense._id,
        status: 'pending'
      });
    }

    // Populate the expense with user and site details
    const populatedExpense = await Expense.findById(newExpense._id)
      .populate('submittedBy', 'name email department')
      .populate('site', 'name code');

    // Get Socket.IO instance
    const io = req.app.get('io');

    // Prepare notification data
    const notificationData = {
      expenseId: newExpense._id,
      expenseNumber: newExpense.expenseNumber,
      submitter: populatedExpense.submittedBy.name,
      site: populatedExpense.site.name,
      amount: newExpense.amount,
      category: newExpense.category,
      timestamp: new Date()
    };

    // Emit new expense notification to all approvers
    io.to('role-l1_approver')
      .to('role-l2_approver')
      .to('role-l3_approver')
      .emit('new_expense_submitted', notificationData);

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: populatedExpense
    });

  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get all expenses
router.get('/all', async (req, res) => {
  try {
    const expenses = await Expense.find({ isActive: true, isDeleted: false })
      .populate('submittedBy', 'name email department')
      .populate('site', 'name code')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: expenses
    });

  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get expenses by submitter
router.get('/submitter/:submitterId', async (req, res) => {
  try {
    const { submitterId } = req.params;
    
    const expenses = await Expense.find({ 
      submittedBy: submitterId,
      isActive: true,
      isDeleted: false
    })
    .populate('site', 'name code')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: expenses
    });

  } catch (error) {
    console.error('Error fetching submitter expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get expenses for approval (pending expenses)
router.get('/pending', protect, authorize('l1_approver', 'l2_approver', 'l3_approver'), async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;
    
    // Get expenses where user is a pending approver
    const pendingApprovals = await PendingApprover.find({
      approver: userId,
      status: 'pending'
    }).select('expense');

    const pendingExpenseIds = pendingApprovals.map(pa => pa.expense);
    
    // Role-based filtering
    let statusFilter = {};
    if (userRole === 'L1_APPROVER') {
      statusFilter = { status: 'submitted' };
    } else if (userRole === 'L2_APPROVER') {
      statusFilter = { status: 'approved_l1' };
    } else if (userRole === 'L3_APPROVER') {
      statusFilter = { status: 'approved_l2' };
    } else {
      // For other roles, show all pending
      statusFilter = { status: { $in: ['submitted', 'approved_l1', 'approved_l2'] } };
    }
    
    const expenses = await Expense.find({
      _id: { $in: pendingExpenseIds },
      ...statusFilter,
      isActive: true,
      isDeleted: false
    })
    .populate('submittedBy', 'name email department')
    .populate('site', 'name code')
    .populate('pendingApprovers.approver', 'name email role')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: expenses
    });

  } catch (error) {
    console.error('Error fetching pending expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get expense by ID
router.get('/:expenseId', async (req, res) => {
  try {
    const { expenseId } = req.params;
    
    const expense = await Expense.findById(expenseId)
      .populate('submittedBy', 'name email department')
      .populate('site', 'name code')
      .populate('approvalHistory.approver', 'name email role')
      .populate('pendingApprovers.approver', 'name email role');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      data: expense
    });

  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Update expense status (approval/rejection)
router.put('/:expenseId/approve', protect, authorize('l1_approver', 'l2_approver', 'l3_approver'), async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { 
      level, 
      approver, 
      approverId: approverIdFromBody, 
      comments, 
      modifiedAmount, 
      modificationReason,
      action, // 'approve', 'reject', or 'payment'
      paymentAmount,
      paymentDate
    } = req.body;

    // Prefer authenticated user ID if available
    const approverId = req.user?.id || req.user?._id || approverIdFromBody;
    if (!approverId) {
      return res.status(400).json({
        success: false,
        message: 'Approver ID is required for approval.'
      });
    }

    const expense = await Expense.findById(expenseId)
      .populate('submittedBy', 'name email')
      .populate('site', 'name code');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Create approval history record
    const approvalHistoryRecord = new ApprovalHistory({
      level: typeof level === 'string' ? parseInt(level.replace('L', '')) : parseInt(level),
      approver: approverId,
      expense: expenseId,
      action: action === 'approve' ? 'approved' : action === 'payment' ? 'payment_processed' : 'rejected',
      comments: comments || '',
      date: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      modifiedAmount: modifiedAmount ? parseFloat(modifiedAmount) : undefined,
      modificationReason,
      paymentAmount: paymentAmount ? parseFloat(paymentAmount) : undefined,
      paymentDate: paymentDate ? new Date(paymentDate) : undefined
    });

    await approvalHistoryRecord.save();

    // Update expense status and other fields
    const levelNum = typeof level === 'string' ? parseInt(level.replace('L', '')) : parseInt(level);
    
    const updateData = {
      status: action === 'reject' ? 'rejected' : 
              action === 'payment' ? 'payment_processed' :
              levelNum === 1 ? 'approved_l1' :
              levelNum === 2 ? 'approved_l2' :
              levelNum === 3 ? 'approved_l3' : 'submitted',
      currentApprovalLevel: action === 'reject' ? expense.currentApprovalLevel : levelNum
    };

    // Add modified amount if provided
    if (modifiedAmount !== undefined && modifiedAmount !== null) {
      updateData.amount = parseFloat(modifiedAmount);
      updateData.modificationReason = modificationReason;
    }

    // Add payment details if payment action
    if (action === 'payment') {
      updateData.paymentAmount = paymentAmount ? parseFloat(paymentAmount) : parseFloat(modifiedAmount || expense.amount);
      updateData.paymentDate = paymentDate ? new Date(paymentDate) : new Date();
      updateData.paymentProcessedBy = approverId;
    }

    // Update the expense
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      updateData,
      { new: true }
    )
    .populate('submittedBy', 'name email')
    .populate('site', 'name code')
    .populate('approvalHistory.approver', 'name email role');

    // Get Socket.IO instance
    const io = req.app.get('io');

    // Prepare notification data
    const notificationData = {
      expenseId: updatedExpense._id,
      expenseNumber: updatedExpense.expenseNumber,
      title: updatedExpense.title,
      amount: updatedExpense.amount,
      status: updatedExpense.status,
      submitter: updatedExpense.submittedBy.name,
      site: updatedExpense.site.name,
      approver: approver,
      level: level,
      action: action,
      timestamp: new Date()
    };

    // Emit notifications based on action and level
    if (action === 'approve') {
      console.log('Emitting approval notification for level:', levelNum);
      
      const socketData = {
        ...notificationData,
        status: 'approved',
        amount: modifiedAmount || updatedExpense.amount,
        category: updatedExpense.category,
        siteName: updatedExpense.site.name,
        siteId: updatedExpense.site._id,
        timestamp: new Date()
      };
      
      console.log('Socket data to be emitted:', socketData);

      // Normalize role names to lowercase
      const l1Room = 'role-l1_approver';
      const l2Room = 'role-l2_approver';
      const l3Room = 'role-l3_approver';

      // Always emit to the specific user's room
      if (approverId) {
        const userRoom = `user-${approverId}`;
        console.log('Emitting to specific approver:', userRoom);
        io.to(userRoom).emit('expense-updated', socketData);
      }

      // Emit to appropriate role rooms
      if (levelNum === 1) {
        console.log('L1 Approval - Emitting to rooms:', { l1Room, l2Room });
        // Notify L1 approvers about their approval
        io.to(l1Room).emit('expense-updated', socketData);
        // Notify L2 approvers about pending approval
        io.to(l2Room).emit('expense_approved_l1', socketData);
      } else if (levelNum === 2) {
        console.log('L2 Approval - Emitting to rooms:', { l2Room, l3Room });
        // Notify L2 approvers about their approval
        io.to(l2Room).emit('expense-updated', socketData);
        // Notify L3 approvers about pending approval
        io.to(l3Room).emit('expense_approved_l2', socketData);
      } else if (levelNum === 3) {
        console.log('L3 Approval - Emitting to room:', l3Room);
        // Notify L3 approvers about final approval
        io.to(l3Room).emit('expense-updated', socketData);
        // Notify submitter
        io.to(`user-${updatedExpense.submittedBy._id}`).emit('expense_approved_final', socketData);
      }

      // Broadcast to all connected clients that need to update their dashboards
      console.log('Broadcasting expense update to all relevant rooms');
      io.emit('dashboard-update', socketData);
    } else if (action === 'payment') {
      // Handle payment processing
      console.log('Emitting payment notification for L3:', levelNum);
      
      const socketData = {
        ...notificationData,
        status: 'payment_processed',
        amount: paymentAmount || modifiedAmount || updatedExpense.amount,
        category: updatedExpense.category,
        siteName: updatedExpense.site.name,
        siteId: updatedExpense.site._id,
        paymentAmount: paymentAmount || modifiedAmount || updatedExpense.amount,
        paymentDate: paymentDate || new Date(),
        timestamp: new Date()
      };
      
      console.log('Payment socket data to be emitted:', socketData);

      // Emit to L3 approvers (finance team)
      const l3Room = 'role-l3_approver';
      
      // Emit to specific approver
      if (approverId) {
        const userRoom = `user-${approverId}`;
        console.log('Emitting payment to specific approver:', userRoom);
        io.to(userRoom).emit('expense-updated', socketData);
      }

      // Emit to L3 room
      io.to(l3Room).emit('expense-updated', socketData);
      
      // Emit payment processed event to L3 approver
      io.to(l3Room).emit('expense_payment_processed', socketData);
      
      // Notify submitter about payment
      io.to(`user-${updatedExpense.submittedBy._id}`).emit('expense_payment_processed', socketData);

      // Broadcast update
      console.log('Broadcasting payment update to all relevant rooms');
      io.emit('dashboard-update', socketData);
    } else {
      // Handle rejection
      const socketData = {
        ...notificationData,
        status: 'rejected',
        amount: modifiedAmount || updatedExpense.amount,
        category: updatedExpense.category,
        siteName: updatedExpense.site.name,
        siteId: updatedExpense.site._id,
        timestamp: new Date()
      };
      
      console.log('Emitting rejection notification:', socketData);
      
      // Normalize role name to lowercase
      const roleRoom = `role-${userRole.toLowerCase()}`;
      console.log('Emitting to role room:', roleRoom);
      
      // Emit to specific approver
      if (approverId) {
        const userRoom = `user-${approverId}`;
        console.log('Emitting to specific approver:', userRoom);
        io.to(userRoom).emit('expense-updated', socketData);
      }

      // Emit to role room
      io.to(roleRoom).emit('expense-updated', socketData);

      // Notify submitter
      io.to(`user-${updatedExpense.submittedBy._id}`).emit('expense_rejected', socketData);

      // Broadcast update
      console.log('Broadcasting expense rejection to all relevant rooms');
      io.emit('dashboard-update', socketData);
    }

    // After updating the expense and before sending response, handle next level PendingApprover creation
    if (action === 'approve') {
      if (levelNum === 1) {
        // Remove L1 PendingApprover for this expense and approver
        await PendingApprover.deleteMany({ expense: expenseId, level: 1, approver: approverId });
        // Create L2 PendingApprover(s)
        const l2Approvers = await User.find({ role: 'l2_approver', site: expense.site._id, isActive: true });
        for (const approver of l2Approvers) {
          await PendingApprover.create({
            level: 2,
            approver: approver._id,
            expense: expenseId,
            status: 'pending'
          });
        }
      } else if (levelNum === 2) {
        // Remove L2 PendingApprover for this expense and approver
        await PendingApprover.deleteMany({ expense: expenseId, level: 2, approver: approverId });
        // Create L3 PendingApprover(s)
        const l3Approvers = await User.find({ role: 'l3_approver', isActive: true });
        for (const approver of l3Approvers) {
          await PendingApprover.create({
            level: 3,
            approver: approver._id,
            expense: expenseId,
            status: 'pending'
          });
        }
      } else if (levelNum === 3) {
        // Remove L3 PendingApprover for this expense and approver
        await PendingApprover.deleteMany({ expense: expenseId, level: 3, approver: approverId });
      }
    } else if (action === 'payment') {
      // Remove L3 PendingApprover for this expense and approver (payment completes the process)
      await PendingApprover.deleteMany({ expense: expenseId, level: 3, approver: approverId });
    } else if (action === 'reject') {
      // Remove all PendingApprovers for this expense if rejected
      await PendingApprover.deleteMany({ expense: expenseId });
    }

    res.json({
      success: true,
      message: action === 'payment' ? 'Payment processed successfully' : 
               `Expense ${action === 'reject' ? 'rejected' : 'approved'} successfully`,
      data: updatedExpense
    });

  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router; 