const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Site = require('../models/Site');

// Create new user (Admin only)
router.post('/create', protect, authorize('l3_approver', 'finance'), async (req, res) => {
  // Debug logs
  console.log('🔍 DEBUG: User creation endpoint hit!');
  console.log('DEBUG: Current user role:', req.user.role);
  console.log('DEBUG: Current user email:', req.user.email);
  console.log('DEBUG: Current user ID:', req.user.id);
  console.log('DEBUG: Request body:', req.body);
  
  try {
    const {
      fullName,
      email,
      phoneNumber,
      employeeId,
      department,
      role,
      site, // Changed from assignedSites to site
      initialPassword,
      // Notification preferences
      emailNotifications,
      pushNotifications,
      smsNotifications,
      // Permissions
      canCreateExpenses,
      canApproveExpenses,
      canManageUsers,
      canManageSites,
      canViewReports,
      canManageBudgets,
      // Address
      streetAddress,
      city,
      state,
      pinCode,
      // Bank Details
      bankAccountNumber,
      bankIfscCode,
      bankName,
      bankAccountHolderName
    } = req.body;

    // Check if user with email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if employee ID already exists
    const existingEmployeeId = await User.findOne({ employeeId });

    if (existingEmployeeId) {
      return res.status(400).json({
        success: false,
        message: 'User with this employee ID already exists'
      });
    }

    // Find site by code if provided
    let siteId = undefined;
    if (site) {
      const foundSite = await Site.findOne({ code: site });
      if (!foundSite) {
        return res.status(400).json({
          success: false,
          message: 'Site not found with the provided code'
        });
      }
      siteId = foundSite._id;
    }

    // Create new user
    const newUser = new User({
      name: fullName,
      email,
      password: initialPassword, // Let the User model handle password hashing
      employeeId,
      department,
      role: role.toLowerCase(), // Convert to lowercase to match Mongoose enum
      phone: phoneNumber,
      site: siteId,
      address: {
        street: streetAddress,
        city,
        state,
        zipCode: pinCode,
        country: 'India'
      },
      bankDetails: {
        accountNumber: bankAccountNumber,
        ifscCode: bankIfscCode,
        bankName: bankName,
        accountHolderName: bankAccountHolderName
      },
      preferences: {
        notifications: {
          email: emailNotifications,
          push: pushNotifications,
          sms: smsNotifications
        },
        language: 'en',
        timezone: 'Asia/Kolkata',
        currency: 'INR'
      },
      permissions: {
        canCreateExpenses,
        canApproveExpenses,
        canManageUsers,
        canManageSites,
        canViewReports,
        canManageBudgets
      },
      isActive: true,
      isEmailVerified: false
    });

    await newUser.save();

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });

  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get all users (Admin only)
router.get('/all', protect, authorize('l3_approver', 'finance'), async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .populate('site', 'name code')
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get user by ID
router.get('/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Users can only access their own data unless they're admin
    if (req.user._id.toString() !== userId && req.user.role !== 'l3_approver') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findById(userId)
      .select('-password')
      .populate('site', 'name code');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Update user profile
router.put('/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, phone, department, avatar, bankDetails } = req.body;

    // Users can only update their own profile unless they're admin
    if (req.user._id.toString() !== userId && req.user.role !== 'l3_approver') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (department) user.department = department;
    if (avatar) user.avatar = avatar;
    if (bankDetails) user.bankDetails = { ...user.bankDetails, ...bankDetails };

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Change password
router.put('/:userId/password', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Users can only change their own password unless they're admin
    if (req.user._id.toString() !== userId && req.user.role !== 'l3_approver') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password (not required for admin)
    if (req.user._id.toString() === userId) {
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Update user role (Admin only)
router.put('/:userId/role', protect, authorize('l3_approver', 'finance'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Deactivate user (Admin only)
router.put('/:userId/deactivate', protect, authorize('l3_approver', 'finance'), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get users by role
router.get('/role/:role', protect, authorize('l3_approver', 'finance'), async (req, res) => {
  try {
    const { role } = req.params;

    const users = await User.find({ 
      role: role, 
      isActive: true 
    })
    .select('-password')
      .sort({ name: 'asc' });

    res.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Error fetching users by role:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router; 