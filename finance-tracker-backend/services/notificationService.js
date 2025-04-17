const Transaction = require("../models/Transaction");
const User = require("../models/User");

exports.checkExpenseIncomeRatio = async (userId) => {
  try {
    // Get the current month's start date
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get all transactions for the current month
    const transactions = await Transaction.find({
      user: userId,
      date: { $gte: startOfMonth }
    });

    // Calculate total income and expenses
    let totalIncome = 0;
    let totalExpenses = 0;

    if (transactions && transactions.length > 0) {
      transactions.forEach(transaction => {
        if (transaction.type === 'income') {
          totalIncome += transaction.amount;
        } else if (transaction.type === 'expense') {
          totalExpenses += transaction.amount;
        }
      });
    }

    // Calculate the ratio
    const expenseIncomeRatio = totalIncome > 0 ? totalExpenses / totalIncome : 0;

    // Generate notification if expenses exceed income
    if (expenseIncomeRatio > 1) {
      const notification = {
        type: 'expense_warning',
        message: `⚠️ Warning: Your expenses (${totalExpenses.toFixed(2)}) have exceeded your income (${totalIncome.toFixed(2)}) this month!`,
        details: {
          totalIncome,
          totalExpenses,
          ratio: expenseIncomeRatio.toFixed(2)
        },
        timestamp: new Date()
      };

      // Update user with notification
      await User.findByIdAndUpdate(
        userId,
        { $push: { notifications: notification } }
      );

      return {
        hasWarning: true,
        notification
      };
    }

    return {
      hasWarning: false,
      totalIncome,
      totalExpenses,
      ratio: expenseIncomeRatio.toFixed(2)
    };
  } catch (error) {
    console.error('Error checking expense-income ratio:', error);
    throw error;
  }
};

exports.getUserNotifications = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user.notifications || [];
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

exports.clearNotifications = async (userId) => {
  try {
    await User.findByIdAndUpdate(
      userId,
      { $set: { notifications: [] } }
    );
    return { message: 'Notifications cleared successfully' };
  } catch (error) {
    console.error('Error clearing notifications:', error);
    throw error;
  }
}; 