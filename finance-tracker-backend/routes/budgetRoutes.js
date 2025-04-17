const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budgetController"); // Ensure this path is correct
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Ensure all functions exist before using them
if (!budgetController.createBudget || !budgetController.getBudgets || !budgetController.updateBudget || !budgetController.deleteBudget || !budgetController.checkBudgetStatus) {
  console.error("❌ Missing required functions in budgetController.js");
  process.exit(1); // Stop the server if there are missing functions
}

// ✅ Create a budget
router.post("/", authMiddleware, budgetController.createBudget);

// ✅ Get all budgets
router.get("/", authMiddleware, budgetController.getBudgets);

// ✅ Update a budget
router.put("/:id", authMiddleware, budgetController.updateBudget);

// ✅ Delete a budget
router.delete("/:id", authMiddleware, budgetController.deleteBudget);

// ✅ Check budget status
router.get("/check-status", authMiddleware, budgetController.checkBudgetStatus);

module.exports = router;
