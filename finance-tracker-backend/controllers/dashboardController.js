const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Goal = require("../models/Goal");
const User = require("../models/User");

exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's preferred currency
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch all transactions for the user
    const transactions = await Transaction.find({ user: userId });

    // Calculate totals using convertedAmount (which is in user's preferred currency)
    const totals = transactions.reduce((acc, transaction) => {
      const amount = transaction.convertedAmount || transaction.amount;
      if (transaction.type === 'income') {
        acc.income += amount;
      } else if (transaction.type === 'expense') {
        acc.expense += amount;
      }
      return acc;
    }, { income: 0, expense: 0 });

    // Get all goals for the user and calculate progress
    const goals = await Goal.find({ user: userId });
    const goalsProgress = goals.map((goal) => ({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      progress: (goal.currentAmount / goal.targetAmount) * 100,
      currency: user.preferredCurrency
    }));

    // Get all budgets and calculate current spend using convertedAmount
    const budgets = await Budget.find({ userId });
    const budgetStatus = await Promise.all(budgets.map(async (budget) => {
      // Get all transactions for this category
      const categoryTransactions = transactions.filter(
        t => t.category === budget.category && t.type === 'expense'
      );

      // Calculate current spend using convertedAmount
      const currentSpend = categoryTransactions.reduce(
        (total, t) => total + (t.convertedAmount || t.amount),
        0
      );

      // Calculate percentage of budget used
      const percentageUsed = (currentSpend / budget.amount) * 100;

      return {
        category: budget.category,
        budgetLimit: budget.amount,
        currentSpend,
        remainingBudget: budget.amount - currentSpend,
        percentageUsed,
        status: getbudgetStatus(percentageUsed),
        currency: user.preferredCurrency
      };
    }));

    // Get recent transactions (limit to 5 for a summary)
    const recentTransactions = transactions
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map(transaction => ({
        ...transaction.toObject(),
        originalAmount: transaction.originalAmount,
        originalCurrency: transaction.originalCurrency,
        convertedAmount: transaction.convertedAmount || transaction.amount,
        preferredCurrency: user.preferredCurrency
      }));

    // Send the dashboard summary response
    res.status(200).json({
      summary: {
        totalIncome: totals.income,
        totalExpense: totals.expense,
        netBalance: totals.income - totals.expense,
        currency: user.preferredCurrency
      },
      goalsProgress,
      budgets: budgetStatus,
      recentTransactions,
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({ message: "Error fetching dashboard summary", error: error.message });
  }
};

// Helper function to determine budget status
function getbudgetStatus(percentageUsed) {
  if (percentageUsed >= 100) {
    return "EXCEEDED";
  } else if (percentageUsed >= 90) {
    return "WARNING";
  } else if (percentageUsed >= 75) {
    return "CAUTION";
  } else {
    return "GOOD";
  }
}
  