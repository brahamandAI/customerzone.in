const express = require('express');
const asyncHandler = require('express-async-handler');
const { protect, authorize, checkPermission } = require('../middleware/auth');
const User = require('../models/User');
const Site = require('../models/Site');
const Expense = require('../models/Expense');

const router = express.Router();

// Helper function to get time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

// @desc    Get dashboard overview for current user
// @route   GET /api/dashboard/overview
// @access  Private
router.get('/overview', protect, authorize('submitter', 'l1_approver', 'l2_approver', 'l3_approver', 'l4_approver'), asyncHandler(async (req, res) => {
  try {
    console.log('Dashboard overview request for user:', req.user._id, 'Role:', req.user.role);
    
  const userId = req.user._id;
    const userRole = req.user.role.toLowerCase();
    const userSite = req.user.site?._id; // Use optional chaining
    
    console.log('User site info:', {
      userSite: userSite,
      userSiteObject: req.user.site,
      hasSite: !!userSite
    });

  let dashboardData = {};

  // Common data for all users
  const currentMonth = new Date();
  currentMonth.setDate(1);
  const nextMonth = new Date(currentMonth);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  // Get all user's expenses (all-time)
  const userExpenses = await Expense.find({
    submittedBy: userId,
    isActive: true,
    isDeleted: false
  });

  const userStats = {
    totalExpenses: userExpenses.length,
    totalAmount: userExpenses.reduce((sum, exp) => sum + exp.amount, 0),
    pendingExpenses: userExpenses.filter(exp => 
      ['submitted', 'under_review', 'approved_l1', 'approved_l2'].includes(exp.status)
    ).length,
    approvedExpenses: userExpenses.filter(exp => exp.status === 'approved').length,
    rejectedExpenses: userExpenses.filter(exp => exp.status === 'rejected').length
  };

  dashboardData.userStats = userStats;

  // Add system-wide pending approvals count (all expenses not yet finally approved/rejected)
  const pendingApprovalsCount = await Expense.countDocuments({
    status: { $in: ['submitted', 'under_review', 'approved_l1', 'approved_l2'] },
    isActive: true,
    isDeleted: false
  });
  dashboardData.pendingApprovalsCount = pendingApprovalsCount;

  // Role-specific data
  if (userRole === 'submitter') {
    // Recent expenses
    const recentExpenses = await Expense.find({
      submittedBy: userId,
      isActive: true,
      isDeleted: false
    })
    .populate('site', 'name code')
    .sort({ createdAt: -1 })
    .limit(5);

    // Site budget info
    const siteInfo = await Site.findById(userSite);
      console.log('Site info for submitter:', {
        siteId: userSite,
        siteInfo: siteInfo ? {
          budget: siteInfo.budget,
          statistics: siteInfo.statistics,
          budgetUtilization: siteInfo.budgetUtilization,
          remainingBudget: siteInfo.remainingBudget
        } : 'Site not found'
      });
    
    dashboardData.recentExpenses = recentExpenses;
    dashboardData.siteBudget = {
        monthly: siteInfo?.budget?.monthly || 0,
        used: siteInfo?.statistics?.monthlySpend || 0,
        remaining: siteInfo?.remainingBudget || 0,
        utilization: siteInfo?.budgetUtilization || (siteInfo?.budget?.monthly > 0 ? Math.round((siteInfo?.statistics?.monthlySpend / siteInfo?.budget?.monthly) * 100) : 0)
    };
    dashboardData.vehicleKmLimit = siteInfo?.vehicleKmLimit;

    // Enhanced recent activities for submitter
    console.log('🔍 Processing recent activities for submitter...');
    
    const userRecentExpenses = await Expense.find({
      submittedBy: userId,
      isActive: true,
      isDeleted: false
    })
    .populate('site', 'name code')
    .sort({ updatedAt: -1 })
    .limit(10);

    console.log(`📝 Found ${userRecentExpenses.length} recent expenses for user`);

    dashboardData.recentActivities = userRecentExpenses.map(expense => {
      let title = '';
      let type = '';
      let status = '';

      switch (expense.status) {
        case 'submitted':
          title = 'Expense submitted';
          type = 'expense_submitted';
          status = 'pending';
          break;
        case 'approved_l1':
          title = 'Expense approved by L1';
          type = 'expense_approved';
          status = 'approved';
          break;
        case 'approved_l2':
          title = 'Expense approved by L2';
          type = 'expense_approved';
          status = 'approved';
          break;
        case 'approved':
          title = 'Expense finally approved';
          type = 'expense_approved';
          status = 'approved';
          break;
        case 'payment_processed':
          title = 'Payment processed';
          type = 'payment_processed';
          status = 'completed';
          break;
        case 'rejected':
          title = 'Expense rejected';
          type = 'expense_rejected';
          status = 'rejected';
          break;
        default:
          title = 'Expense updated';
          type = 'expense_update';
          status = 'pending';
      }

      return {
        id: expense._id,
        type: type,
        title: title,
        description: `${expense.site?.name || 'Unknown Site'} - ₹${expense.amount.toLocaleString()}`,
        time: getTimeAgo(expense.updatedAt),
        status: status
      };
    });

    console.log(`✅ Created ${dashboardData.recentActivities.length} recent activities`);

    // Top expense categories for submitter
    console.log('🔍 Processing top categories for submitter...');
    
    const topCategories = await Expense.aggregate([
      {
        $match: {
          submittedBy: userId,
          isActive: true,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalAmount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    console.log(`📊 Found ${topCategories.length} top categories`);

    // Calculate percentages
    const totalUserExpenses = await Expense.aggregate([
      {
        $match: {
          submittedBy: userId,
          isActive: true,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const userTotalAmount = totalUserExpenses[0]?.totalAmount || 0;
    console.log(`💰 Total user amount: ₹${userTotalAmount.toLocaleString()}`);

    dashboardData.topCategories = topCategories.map(category => ({
      name: category._id,
      amount: category.totalAmount,
      count: category.count,
      percentage: userTotalAmount > 0 ? Math.round((category.totalAmount / userTotalAmount) * 100) : 0
    }));

    console.log(`✅ Created ${dashboardData.topCategories.length} top categories`);

    } else if (['l1_approver', 'l2_approver', 'l3_approver', 'l4_approver'].includes(userRole)) {
      console.log('Processing dashboard for approver role:', userRole);
      // For L4 Approver, don't show approval-related data
      if (userRole === 'l4_approver') {
        console.log('Setting up dashboard for L4 Approver');
        dashboardData.pendingApprovals = [];
        dashboardData.approvalStats = {
          totalApprovals: 0,
          approvedCount: 0,
          rejectedCount: 0,
          totalAmount: 0
        };
        dashboardData.monthlyStats = {
          monthlyApprovedAmount: 0,
          monthlyApprovedCount: 0
        };
      } else {
        // Pending approvals for other approvers
    const pendingApprovals = await Expense.getPendingExpensesForApprover(userId);
    
    // Approval statistics
    const approvalStats = await Expense.aggregate([
      {
        $match: {
          'approvalHistory.approver': userId,
          isActive: true,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          totalApprovals: { $sum: 1 },
          approvedCount: {
            $sum: {
              $cond: [
                { $in: ['approved', '$approvalHistory.action'] },
                1,
                0
              ]
            }
          },
          rejectedCount: {
            $sum: {
              $cond: [
                { $in: ['rejected', '$approvalHistory.action'] },
                1,
                0
              ]
            }
              },
              totalAmount: {
                $sum: {
                  $cond: [
                    { $in: ['approved', '$approvalHistory.action'] },
                    '$amount',
                    0
                  ]
                }
          }
        }
      }
    ]);

    dashboardData.pendingApprovals = pendingApprovals;
    dashboardData.approvalStats = approvalStats[0] || {
      totalApprovals: 0,
      approvedCount: 0,
          rejectedCount: 0,
          totalAmount: 0
    };

        // Get current month's approved amount
        const currentMonth = new Date();
        currentMonth.setDate(1);
        const nextMonth = new Date(currentMonth);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const monthlyStats = await Expense.aggregate([
          {
            $match: {
              'approvalHistory.approver': userId,
              'approvalHistory.action': 'approved',
              'approvalHistory.date': { $gte: currentMonth, $lt: nextMonth },
              isActive: true,
              isDeleted: false
            }
          },
          {
            $group: {
              _id: null,
              monthlyApprovedAmount: { $sum: '$amount' },
              monthlyApprovedCount: { $sum: 1 }
            }
          }
        ]);

        dashboardData.monthlyStats = monthlyStats[0] || {
          monthlyApprovedAmount: 0,
          monthlyApprovedCount: 0
        };
      }

      // If L3 or L4 approver, get system-wide statistics
      if (userRole === 'l3_approver' || userRole === 'l4_approver') {
      const systemStats = await getSystemStatistics();
      dashboardData.systemStats = systemStats;

      // Budget alerts
      const budgetAlerts = await Site.getSitesWithBudgetAlerts();
      dashboardData.budgetAlerts = budgetAlerts;

      // Recent activity
      const recentActivity = await getRecentActivity();
      dashboardData.recentActivity = recentActivity;

      // For approvers, use the general recent activity
      dashboardData.recentActivities = recentActivity.map(activity => ({
        id: activity.expense.id,
        type: activity.type,
        title: `${activity.expense.title} ${activity.expense.status}`,
        description: `${activity.site?.name || 'Unknown Site'} - ₹${activity.expense.amount.toLocaleString()}`,
        time: getTimeAgo(activity.timestamp),
        status: activity.expense.status
      }));

      // Top categories for approvers (system-wide or site-specific)
      let matchFilter = { isActive: true, isDeleted: false };
      
      if (userRole !== 'l3_approver' && userRole !== 'l4_approver') {
        matchFilter.site = req.user.site?._id;
      }

      const topCategories = await Expense.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$category',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { totalAmount: -1 }
        },
        {
          $limit: 5
        }
      ]);

      // Calculate percentages
      const totalExpenses = await Expense.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);

      const totalAmount = totalExpenses[0]?.totalAmount || 0;

      dashboardData.topCategories = topCategories.map(category => ({
        name: category._id,
        amount: category.totalAmount,
        count: category.count,
        percentage: totalAmount > 0 ? Math.round((category.totalAmount / totalAmount) * 100) : 0
      }));
    }
  }

  // Get notifications count
  const notificationsCount = await getNotificationsCount(userId);
  dashboardData.notificationsCount = notificationsCount;

  // Debug: Log the complete response
  console.log('📊 Complete Dashboard Response:', {
    userRole: userRole,
    hasRecentActivities: !!dashboardData.recentActivities,
    hasTopCategories: !!dashboardData.topCategories,
    recentActivitiesCount: dashboardData.recentActivities?.length || 0,
    topCategoriesCount: dashboardData.topCategories?.length || 0,
    userStats: dashboardData.userStats,
    siteBudget: dashboardData.siteBudget
  });

  res.json({
    success: true,
    data: dashboardData
  });
  } catch (error) {
    console.error('Error in dashboard overview route:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}));

// @desc    Get expense statistics
// @route   GET /api/dashboard/expense-stats
// @access  Private
router.get('/expense-stats', protect, authorize('submitter', 'l1_approver', 'l2_approver', 'l3_approver', 'l4_approver'), asyncHandler(async (req, res) => {
  const { period = 'month', category, site } = req.query;
  const userId = req.user._id;
  const userRole = req.user.role;

  let dateFilter = {};
  const now = new Date();

  // Set date filter based on period
  switch (period) {
    case 'week':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      dateFilter = { expenseDate: { $gte: weekStart } };
      break;
    case 'month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { expenseDate: { $gte: monthStart } };
      break;
    case 'quarter':
      const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      dateFilter = { expenseDate: { $gte: quarterStart } };
      break;
    case 'year':
      const yearStart = new Date(now.getFullYear(), 0, 1);
      dateFilter = { expenseDate: { $gte: yearStart } };
      break;
  }

  let matchFilter = {
    ...dateFilter,
    isActive: true,
    isDeleted: false
  };

  // Apply filters based on user role
  if (userRole === 'submitter') {
    matchFilter.submittedBy = userId;
  } else if (userRole !== 'l3_approver' && userRole !== 'l4_approver') {
    matchFilter.site = req.user.site?._id; // Use optional chaining to avoid error
  }

  // Apply additional filters
  if (category) {
    matchFilter.category = category;
  }
  if (site && (userRole === 'l3_approver' || userRole === 'l4_approver')) {
    matchFilter.site = site;
  }

  const stats = await Expense.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: {
          category: '$category',
          status: '$status'
        },
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    {
      $group: {
        _id: '$_id.category',
        statuses: {
          $push: {
            status: '$_id.status',
            count: '$count',
            amount: '$totalAmount'
          }
        },
        totalCount: { $sum: '$count' },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);

  // Get trend data
  const trendData = await Expense.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: {
          year: { $year: '$expenseDate' },
          month: { $month: '$expenseDate' },
          day: period === 'week' ? { $dayOfMonth: '$expenseDate' } : null
        },
        count: { $sum: 1 },
        amount: { $sum: '$amount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  res.json({
    success: true,
    data: {
      categoryStats: stats,
      trendData,
      period
    }
  });
}));

// @desc    Get budget overview
// @route   GET /api/dashboard/budget-overview
// @access  Private
router.get('/budget-overview', protect, authorize('l1_approver', 'l2_approver', 'l3_approver', 'l4_approver'), checkPermission('canViewReports'), asyncHandler(async (req, res) => {
  const userRole = req.user.role;
  const userSite = req.user.site?._id; // Use optional chaining to avoid error

  let sites = [];

  if (userRole === 'l3_approver' || userRole === 'l4_approver') {
    // Get all sites
    sites = await Site.find({ isActive: true });
  } else {
    // Get only user's site
    sites = await Site.find({ _id: userSite, isActive: true });
  }

  const budgetOverview = await Promise.all(sites.map(async (site) => {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Get current month expenses for this site
    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          site: site._id,
          expenseDate: { $gte: currentMonth, $lt: nextMonth },
          status: { $in: ['approved', 'reimbursed'] },
          isActive: true,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalSpent = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const utilization = site.budget.monthly > 0 ? (totalSpent / site.budget.monthly) * 100 : 0;

    return {
      siteId: site._id,
      siteName: site.name,
      siteCode: site.code,
      budget: {
        monthly: site.budget.monthly,
        yearly: site.budget.yearly,
        categories: site.budget.categories
      },
      spent: totalSpent,
      remaining: Math.max(0, site.budget.monthly - totalSpent),
      utilization: Math.round(utilization),
      status: utilization >= 100 ? 'exceeded' : utilization >= site.budget.alertThreshold ? 'warning' : 'healthy',
      categoryBreakdown: monthlyExpenses
    };
  }));

  res.json({
    success: true,
    data: budgetOverview
  });
}));

// @desc    Get pending approvals summary
// @route   GET /api/dashboard/pending-approvals
// @access  Private (Approvers only)
router.get('/pending-approvals', protect, authorize('l1_approver', 'l2_approver', 'l3_approver'), asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  const pendingExpenses = await Expense.find({
    'pendingApprovers.approver': userId,
    status: { $in: ['submitted', 'under_review', 'approved_l1', 'approved_l2'] },
    isActive: true,
    isDeleted: false
  })
  .populate('submittedBy', 'name email')
  .populate('site', 'name code')
  .sort({ submissionDate: 1 });

  // Group by priority and urgency
  const groupedExpenses = {
    urgent: pendingExpenses.filter(exp => 
      exp.priority === 'urgent' || exp.daysSinceSubmission > 7
    ),
    high: pendingExpenses.filter(exp => 
      exp.priority === 'high' && exp.daysSinceSubmission <= 7
    ),
    normal: pendingExpenses.filter(exp => 
      ['medium', 'low'].includes(exp.priority) && exp.daysSinceSubmission <= 7
    )
  };

  // Get summary statistics
  const summary = {
    total: pendingExpenses.length,
    totalAmount: pendingExpenses.reduce((sum, exp) => sum + exp.amount, 0),
    urgent: groupedExpenses.urgent.length,
    overdue: pendingExpenses.filter(exp => exp.daysSinceSubmission > 7).length,
    avgProcessingTime: await getAverageProcessingTime(userId)
  };

  res.json({
    success: true,
    data: {
      summary,
      expenses: groupedExpenses,
      allExpenses: pendingExpenses
    }
  });
}));

// @desc    Get recent activity
// @route   GET /api/dashboard/recent-activity
// @access  Private
router.get('/recent-activity', protect, authorize('submitter', 'l1_approver', 'l2_approver', 'l3_approver', 'l4_approver'), asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  const userId = req.user._id;
  const userRole = req.user.role;

  let matchFilter = {
    isActive: true,
    isDeleted: false
  };

  // Filter based on user role
  if (userRole === 'submitter') {
    matchFilter.submittedBy = userId;
  } else if (userRole !== 'l3_approver' && userRole !== 'l4_approver') {
    matchFilter.site = req.user.site?._id; // Use optional chaining to avoid error
  }

  const recentExpenses = await Expense.find(matchFilter)
    .populate('submittedBy', 'name email')
    .populate('site', 'name code')
    .populate('approvalHistory.approver', 'name email')
    .sort({ updatedAt: -1 })
    .limit(parseInt(limit));

  // Format activity feed
  const activities = [];

  recentExpenses.forEach(expense => {
    // Add submission activity
    activities.push({
      type: 'expense_submitted',
      expense: {
        id: expense._id,
        title: expense.title,
        amount: expense.amount,
        status: expense.status
      },
      user: expense.submittedBy,
      site: expense.site,
      timestamp: expense.submissionDate,
      description: `Expense "${expense.title}" submitted for ₹${expense.amount}`
    });

    // Add approval activities
    expense.approvalHistory.forEach(approval => {
      activities.push({
        type: `expense_${approval.action}`,
        expense: {
          id: expense._id,
          title: expense.title,
          amount: expense.amount,
          status: expense.status
        },
        user: approval.approver,
        site: expense.site,
        timestamp: approval.date,
        description: `Expense "${expense.title}" ${approval.action} by ${approval.approver.name}`,
        comments: approval.comments
      });
    });
  });

  // Sort by timestamp and limit
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const limitedActivities = activities.slice(0, parseInt(limit));

  res.json({
    success: true,
    data: limitedActivities
  });
}));

// @desc    Get expense analytics
// @route   GET /api/dashboard/analytics
// @access  Private (L2, L3 approvers only)
router.get('/analytics', protect, authorize('l2_approver', 'l3_approver', 'l4_approver'), asyncHandler(async (req, res) => {
  const { startDate, endDate, site } = req.query;
  const userRole = req.user.role;

  let dateFilter = {};
  if (startDate && endDate) {
    dateFilter = {
      expenseDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
  } else {
    // Default to current year
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    dateFilter = { expenseDate: { $gte: yearStart } };
  }

  let matchFilter = {
    ...dateFilter,
    isActive: true,
    isDeleted: false
  };

  // Apply site filter
  if (userRole !== 'l3_approver' && userRole !== 'l4_approver') {
    matchFilter.site = req.user.site?._id; // Use optional chaining to avoid error
  } else if (site) {
    matchFilter.site = site;
  }

  // Get comprehensive analytics
  const analytics = await Promise.all([
    // Monthly trends
    Expense.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            year: { $year: '$expenseDate' },
            month: { $month: '$expenseDate' }
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]),

    // Category analysis
    Expense.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
          maxAmount: { $max: '$amount' },
          minAmount: { $min: '$amount' }
        }
      },
      { $sort: { amount: -1 } }
    ]),

    // User analysis (top spenders)
    Expense.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$submittedBy',
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $sort: { amount: -1 } },
      { $limit: 10 }
    ]),

    // Site analysis (if L3 approver)
    userRole === 'l3_approver' ? Expense.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$site',
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' }
        }
      },
      {
        $lookup: {
          from: 'sites',
          localField: '_id',
          foreignField: '_id',
          as: 'site'
        }
      },
      { $unwind: '$site' },
      { $sort: { amount: -1 } }
    ]) : Promise.resolve([])
  ]);

  res.json({
    success: true,
    data: {
      monthlyTrends: analytics[0],
      categoryAnalysis: analytics[1],
      topSpenders: analytics[2],
      siteAnalysis: analytics[3]
    }
  });
}));

// Helper function to get system statistics
async function getSystemStatistics() {
  const currentMonth = new Date();
  currentMonth.setDate(1);
  const nextMonth = new Date(currentMonth);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const [totalUsers, totalSites, monthlyExpenses, totalExpenses] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Site.countDocuments({ isActive: true }),
    Expense.aggregate([
      {
        $match: {
          expenseDate: { $gte: currentMonth, $lt: nextMonth },
          isActive: true,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]),
    Expense.aggregate([
      {
        $match: { isActive: true, isDeleted: false }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ])
  ]);

  return {
    totalUsers,
    totalSites,
    monthlyExpenses: monthlyExpenses[0] || { count: 0, amount: 0 },
    totalExpenses: totalExpenses[0] || { count: 0, amount: 0 }
  };
}

// Helper function to get recent activity
async function getRecentActivity() {
  const recentExpenses = await Expense.find({
    isActive: true,
    isDeleted: false
  })
  .populate('submittedBy', 'name email')
  .populate('site', 'name code')
  .sort({ updatedAt: -1 })
  .limit(10);

  return recentExpenses.map(expense => ({
    type: 'expense_update',
    expense: {
      id: expense._id,
      title: expense.title,
      amount: expense.amount,
      status: expense.status
    },
    user: expense.submittedBy,
    site: expense.site,
    timestamp: expense.updatedAt
  }));
}

// Helper function to get notifications count
async function getNotificationsCount(userId) {
  // This would typically query a notifications collection
  // For now, we'll return pending approvals count
  const pendingCount = await Expense.countDocuments({
    'pendingApprovers.approver': userId,
    isActive: true,
    isDeleted: false
  });

  return {
    total: pendingCount,
    unread: pendingCount // Assuming all pending are unread
  };
}

// Helper function to get average processing time
async function getAverageProcessingTime(approverId) {
  const approvedExpenses = await Expense.find({
    'approvalHistory.approver': approverId,
    status: { $in: ['approved', 'rejected'] },
    isActive: true,
    isDeleted: false
  });

  if (approvedExpenses.length === 0) return 0;

  const totalProcessingTime = approvedExpenses.reduce((total, expense) => {
    const submission = expense.submissionDate;
    const approval = expense.approvalHistory.find(ah => 
      ah.approver.toString() === approverId.toString()
    );
    
    if (submission && approval) {
      return total + (approval.date - submission);
    }
    return total;
  }, 0);

  // Return average in hours
  return Math.round(totalProcessingTime / (approvedExpenses.length * 1000 * 60 * 60));
}

module.exports = router; 