const express = require("express");
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getTransactionById,
  getTransactionsByCurrency,
  getExchangeRateForCurrency,
  getTransactionsByTags  // ✅ Add this here
} = require("../controllers/transactionController");

const authMiddleware = require("../middleware/authMiddleware");
const adminAuth = require("../middleware/adminAuth");
const transactionController = require("../controllers/transactionController");


const router = express.Router();

// Create a transaction
router.post("/", authMiddleware, createTransaction);

// Get all transactions for a user
router.get("/", authMiddleware, getTransactions);

// ✅ Get transactions by tags (user-specific)
router.get("/tags", authMiddleware, getTransactionsByTags);

// Get a specific transaction by ID
router.get("/:id", authMiddleware, getTransactionById);

// Update a transaction
router.put("/:id", authMiddleware, updateTransaction);

// Delete a transaction
router.delete("/:id", authMiddleware, deleteTransaction);

// Get transactions by currency
router.get("/currency/:currency", authMiddleware, getTransactionsByCurrency);

// Get exchange rate for a specific currency
router.get("/exchange-rate/:currency", authMiddleware, getExchangeRateForCurrency);



module.exports = router;
