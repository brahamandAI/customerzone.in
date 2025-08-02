const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rakshak-expense', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

const Expense = require('./models/Expense');

async function testApprovalHistory() {
  try {
    console.log('🔍 Testing approval history...');
    
    // Find a recent expense that was approved
    const recentExpense = await Expense.findOne({
      status: { $in: ['approved_l1', 'approved_l2', 'approved'] },
      isActive: true,
      isDeleted: false
    }).sort({ updatedAt: -1 });
    
    if (!recentExpense) {
      console.log('❌ No recent approved expense found');
      return;
    }
    
    console.log('📄 Found expense:', {
      id: recentExpense._id,
      expenseNumber: recentExpense.expenseNumber,
      status: recentExpense.status,
      approvalHistory: recentExpense.approvalHistory
    });
    
    // Check if approval history exists
    if (!recentExpense.approvalHistory || recentExpense.approvalHistory.length === 0) {
      console.log('❌ No approval history found for this expense');
      
      // Add a test approval history entry
      const testApprovalEntry = {
        approver: '6874fe8918f6927399a77f7d', // Amit Kumar's ID
        action: 'approved',
        date: new Date(),
        comments: 'Test approval entry',
        level: 1
      };
      
      console.log('➕ Adding test approval history entry:', testApprovalEntry);
      
      const updatedExpense = await Expense.findByIdAndUpdate(
        recentExpense._id,
        {
          $push: { approvalHistory: testApprovalEntry }
        },
        { new: true }
      );
      
      console.log('✅ Updated expense with approval history:', {
        id: updatedExpense._id,
        approvalHistory: updatedExpense.approvalHistory
      });
      
    } else {
      console.log('✅ Approval history exists:', recentExpense.approvalHistory);
    }
    
    // Test the aggregation query
    console.log('🧪 Testing aggregation query...');
    const testUserId = '6874fe8918f6927399a77f7d';
    
    const approvalStats = await Expense.aggregate([
      {
        $match: {
          'approvalHistory.approver': testUserId,
          isActive: true,
          isDeleted: false
        }
      },
      {
        $unwind: '$approvalHistory'
      },
      {
        $match: {
          'approvalHistory.approver': testUserId
        }
      },
      {
        $group: {
          _id: null,
          totalApprovals: { $sum: 1 },
          approvedCount: {
            $sum: {
              $cond: [
                { $eq: ['$approvalHistory.action', 'approved'] },
                1,
                0
              ]
            }
          },
          rejectedCount: {
            $sum: {
              $cond: [
                { $eq: ['$approvalHistory.action', 'rejected'] },
                1,
                0
              ]
            }
          },
          totalAmount: {
            $sum: {
              $cond: [
                { $eq: ['$approvalHistory.action', 'approved'] },
                '$amount',
                0
              ]
            }
          }
        }
      }
    ]);
    
    console.log('📊 Aggregation result:', approvalStats);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testApprovalHistory(); 