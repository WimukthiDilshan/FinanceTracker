const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

// ✅ Create a Budget
const createBudget = async (req, res) => {
  try {
    const { category, amount, period } = req.body;
    const userId = req.user.id;

    if (!category || !amount || !period) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newBudget = await Budget.create({ userId, category, amount, period });
    res.status(201).json({ message: "Budget created successfully", budget: newBudget });
  } catch (error) {
    console.error("❌ Error creating budget:", error);
    res.status(500).json({ message: "Error creating budget", error: error.message });
  }
};

// ✅ Get all Budgets
const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id });
    res.json(budgets);
  } catch (error) {
    console.error("❌ Error fetching budgets:", error);
    res.status(500).json({ message: "Error fetching budgets", error: error.message });
  }
};

// ✅ Update Budget
const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, amount, period } = req.body;

    const updatedBudget = await Budget.findByIdAndUpdate(
      id,
      { category, amount, period },
      { new: true }
    );

    if (!updatedBudget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.json({ message: "Budget updated successfully", budget: updatedBudget });
  } catch (error) {
    console.error("❌ Error updating budget:", error);
    res.status(500).json({ message: "Error updating budget", error: error.message });
  }
};

// ✅ Delete Budget
const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBudget = await Budget.findByIdAndDelete(id);

    if (!deletedBudget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting budget:", error);
    res.status(500).json({ message: "Error deleting budget", error: error.message });
  }
};

// ✅ Check Budget Status (Moved from helpers)
const checkBudgetStatus = async (req, res) => {
  try {
    const userId = req.user.id; // Ensure that the user ID is coming from the authenticated user
    const budgets = await Budget.find({ userId });

    if (!budgets.length) {
      return res.json({ message: "No budgets set for tracking." });
    }

    const budgetCategories = budgets.map(b => b.category);

    // Aggregation for expenses in each budget category
    const transactions = await Transaction.aggregate([
      { 
        $match: { 
          user: userId, 
          category: { $in: budgetCategories }, 
          type: "expense" 
        } 
      },
      { 
        $group: { 
          _id: "$category", 
          total: { $sum: "$amount" } 
        } 
      }
    ]);

    // Prepare the warnings if the spending exceeds budget
    const warnings = budgets.map(budget => {
      const spentAmount = transactions.find(t => t._id === budget.category)?.total || 0;

      // Check if the spent amount exceeds budget
      if (spentAmount > budget.amount) {
        return `⚠️ You have exceeded your budget for ${budget.category}! Spent: $${spentAmount}, Limit: $${budget.amount}`;
      }
      // Check if the spent amount is nearing the budget limit
      else if (spentAmount > budget.amount * 0.9) {
        return `⚠️ Warning: You are nearing your budget limit for ${budget.category}. Spent: $${spentAmount}, Limit: $${budget.amount}`;
      }
    }).filter(Boolean);

    // Return warnings if there are any
    if (warnings.length) {
      return res.json({ warnings });
    }

    res.json({ message: "You're within your limits." });
  } catch (error) {
    console.error("❌ Error checking budget status:", error);
    res.status(500).json({ message: "Error checking budget status", error: error.message });
  }
};


// ✅ Export all functions
module.exports = {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  checkBudgetStatus
};
