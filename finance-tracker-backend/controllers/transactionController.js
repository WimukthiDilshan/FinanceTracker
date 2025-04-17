const Transaction = require("../models/Transaction");
const Goal = require("../models/Goal");
const axios = require("axios");
const { checkBudgetLimit } = require("../services/budgetService");
const Budget = require("../models/Budget");
const User = require("../models/User");
const { checkExpenseIncomeRatio } = require("../services/notificationService");

const EXCHANGE_RATE_API = process.env.EXCHANGE_RATE_API || "https://v6.exchangerate-api.com/v6/2f5358bf7df61b14223a8185/latest/";

exports.createTransaction = async (req, res) => {
  try {
    const { amount, category, type, currency, tags, recurring, goalId } = req.body;
    const userId = req.user.id;

    // Get user's preferred currency
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let exchangeRate = 1;
    let convertedAmount = amount;
    if (currency && currency !== user.preferredCurrency) {
      try {
        console.log(`Converting from ${currency} to ${user.preferredCurrency}`);
        const response = await axios.get(`${EXCHANGE_RATE_API}${currency}`);
        if (!response.data || !response.data.conversion_rates) {
          throw new Error("Invalid API response format");
        }
        exchangeRate = response.data.conversion_rates[user.preferredCurrency];
        if (!exchangeRate) {
          throw new Error(`Exchange rate not found for ${user.preferredCurrency}`);
        }
        convertedAmount = amount * exchangeRate;
        console.log(`Exchange rate: ${exchangeRate}, Converted amount: ${convertedAmount}`);
      } catch (error) {
        console.error("Error fetching exchange rate:", error.message);
        return res.status(500).json({ 
          message: "Failed to fetch exchange rate", 
          error: error.message 
        });
      }
    }

    // Handle savings and goal updates for savings transactions
    let goalStatusMessage = null;
    if (type === "savings" && goalId) {
      const goal = await Goal.findById(goalId);
      
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }

      const previousAmount = goal.currentAmount;
      goal.currentAmount += convertedAmount;

      if (goal.currentAmount >= goal.targetAmount) {
        goal.currentAmount = goal.targetAmount;
        goalStatusMessage = "🎉 Your goal is successful! 🎉";
      } else {
        goalStatusMessage = `Progress: Your goal is now at ${goal.currentAmount}/${goal.targetAmount}`;
      }

      await goal.save();
    }

    // Check budget status for expense transactions
    let budgetWarning = null;
    if (type === "expense") {
      budgetWarning = await checkBudgetLimit(userId, category, convertedAmount);
    }

    // Create and save the new transaction
    const newTransaction = new Transaction({
      user: userId,
      amount: convertedAmount,
      category,
      type,
      currency: user.preferredCurrency,
      originalAmount: amount,
      originalCurrency: currency || user.preferredCurrency,
      exchangeRate,
      convertedAmount,
      tags,
      recurring,
      goalId: goalId || null
    });

    const savedTransaction = await newTransaction.save();

    // Check expense-income ratio after saving the transaction
    let expenseWarning = null;
    if (type === "expense") {
      try {
        const ratioCheck = await checkExpenseIncomeRatio(userId);
        if (ratioCheck && ratioCheck.hasWarning) {
          expenseWarning = ratioCheck.notification;
        }
      } catch (error) {
        console.error("Error checking expense-income ratio:", error);
        // Don't fail the transaction creation if ratio check fails
      }
    }

    res.status(201).json({
      message: "Transaction created successfully",
      transaction: savedTransaction,
      budgetWarning,
      goalStatusMessage,
      expenseWarning
    });
  } catch (error) {
    console.error("Transaction creation error:", error);
    res.status(500).json({ message: "Failed to create transaction", error: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions", error: error.message });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transaction", error: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { amount, category, type, currency, tags, recurring } = req.body;
    const userId = req.user.id;

    // Find the transaction
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Get user's preferred currency
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Store original amount and currency
    const originalAmount = amount;
    const originalCurrency = currency || user.preferredCurrency;

    // Calculate exchange rate and converted amount
    let exchangeRate = 1;
    let convertedAmount = amount;

    if (currency && currency !== user.preferredCurrency) {
      try {
        const response = await axios.get(`${EXCHANGE_RATE_API}/${currency}`);
        const rates = response.data.conversion_rates;
        exchangeRate = rates[user.preferredCurrency];
        if (!exchangeRate) {
          return res.status(400).json({ message: "Invalid currency conversion" });
        }
        convertedAmount = amount * exchangeRate;
      } catch (error) {
        console.error("Error fetching exchange rate:", error.message);
        return res.status(500).json({ message: "Error fetching exchange rate" });
      }
    }

    // Update budget check if it's an expense (using converted amount)
    if (type === "expense") {
      const budgetWarning = await checkBudgetLimit(userId, category, convertedAmount);
      if (budgetWarning.warning) {
        console.log("Budget warning:", budgetWarning.message);
      }
    }

    // Update the transaction with new values
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        amount: convertedAmount, // Store the converted amount as main amount
        category,
        type,
        currency: user.preferredCurrency, // Always store user's preferred currency
        exchangeRate,
        convertedAmount,
        originalAmount,
        originalCurrency,
        tags,
        recurring
      },
      { new: true }
    );

    res.status(200).json({
      message: "Transaction updated successfully",
      transaction: updatedTransaction,
      details: {
        originalAmount,
        originalCurrency,
        convertedAmount,
        finalCurrency: user.preferredCurrency,
        exchangeRate
      }
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ message: "Error updating transaction", error: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    
    await transaction.deleteOne();
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting transaction", error: error.message });
  }
};

exports.getTransactionsByCurrency = async (req, res) => {
  try {
    const { currency } = req.params;
    const transactions = await Transaction.find({ user: req.user.id, currency: currency.toUpperCase() });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions by currency", error: error.message });
  }
};

exports.getExchangeRateForCurrency = async (req, res) => {
  try {
    const { currency } = req.params;
    const response = await axios.get(EXCHANGE_RATE_API);
    const rates = response.data.rates;

    if (!rates[currency]) return res.status(400).json({ message: "Currency not found" });

    res.status(200).json({ currency, exchangeRate: rates[currency] });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch exchange rate", error: error.message });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all transactions", error: error.message });
  }
};

exports.getTransactionsByTags = async (req, res) => {
  try {
    const { tags } = req.query;
    if (!tags) return res.status(400).json({ message: "Tags are required" });

    const tagArray = tags.split(",").map(tag => tag.trim());
    const transactions = await Transaction.find({ user: req.user.id, tags: { $in: tagArray } });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions by tags", error: error.message });
  }
};
