const mongoose = require("mongoose");
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

exports.checkBudgetLimit = async (userId, category, newExpenseAmount) => {
  try {
    // ✅ Convert userId to ObjectId if it's a string
    const userObjectId =
      mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    
    // ✅ Get user's preferred currency
    const user = await User.findById(userObjectId);
    if (!user) {
      throw new Error("User not found");
    }

    // ✅ Retrieve the budget for the given category
    const budget = await Budget.findOne({ userId: userObjectId, category });
    if (!budget) {
      console.log(`No budget set for category: ${category}`);
      return { warning: false, message: "No budget set for this category." };
    }

    // ✅ Calculate date range based on budget period
    const now = new Date();
    let startDate;
    switch (budget.period) {
      case "daily":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "weekly":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay()); // Start of current week
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Default to monthly
    }
    
    // ✅ Ensure newExpenseAmount is a valid number
    const expenseAmount = Number(newExpenseAmount);
    if (isNaN(expenseAmount)) {
      throw new Error("Invalid newExpenseAmount provided");
    }
    
    // ✅ Retrieve and sum all previous expense transactions for this category within the period
    const totalSpentResult = await Transaction.aggregate([
      {
        $match: {
          user: userObjectId,
          category: category,
          type: "expense",
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$convertedAmount" }
        }
      }
    ]);
    
    // ✅ If no matching transactions, previousTotal defaults to 0
    const previousTotal = totalSpentResult.length > 0 ? totalSpentResult[0].total : 0;
    
    // ✅ Add the new expense to the previous total
    // Note: newExpenseAmount should already be in the user's preferred currency
    const newTotal = previousTotal + expenseAmount;
    
    console.log(`Budget for ${category}: ${budget.amount} ${user.preferredCurrency} (${budget.period})`);
    console.log(`Previous total for ${category} (${budget.period}): ${previousTotal} ${user.preferredCurrency}`);
    console.log(`New total after adding expense: ${newTotal} ${user.preferredCurrency}`);
    
    // ✅ Generate a message based on the new total
    let message = "";
    if (newTotal < budget.amount * 0.9) {
      message = `You are within your ${budget.period} budget limit.`;
    } else if (newTotal >= budget.amount * 0.9 && newTotal < budget.amount) {
      message = `⚠️ Warning: You are nearing your ${budget.period} budget limit for ${category}. Spent: ${newTotal} ${user.preferredCurrency}, Limit: ${budget.amount} ${user.preferredCurrency}`;
    } else if (newTotal === budget.amount) {
      message = `You have reached your ${budget.period} budget limit. Spent: ${newTotal} ${user.preferredCurrency}, Limit: ${budget.amount} ${user.preferredCurrency}`;
    } else if (newTotal > budget.amount) {
      message = `🚨 You have exceeded your ${budget.period} budget for ${category}! Spent: ${newTotal} ${user.preferredCurrency}, Limit: ${budget.amount} ${user.preferredCurrency}`;
    }
    
    return {
      warning: newTotal > budget.amount,
      message,
      budgetLimit: budget.amount,
      totalSpent: newTotal,
      currency: user.preferredCurrency,
      period: budget.period
    };
  } catch (error) {
    console.error("Error in checkBudgetLimit:", error.message);
    return { warning: false, message: `Budget check failed: ${error.message}` };
  }
};
