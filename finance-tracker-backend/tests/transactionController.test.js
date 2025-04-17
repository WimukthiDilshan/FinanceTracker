const axios = require("axios");
const { createTransaction, getTransactions, updateTransaction, deleteTransaction } = require("../controllers/transactionController");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Goal = require("../models/Goal");
const { checkBudgetLimit } = require("../services/budgetService");

// Mock dependencies
jest.mock("axios");
jest.mock("../models/Transaction");
jest.mock("../models/User");
jest.mock("../models/Goal");
jest.mock("../services/budgetService");

describe("Transaction Controller", () => {
  // Mock request and response objects
  const mockRequest = (body = {}, userId = "user123", params = {}) => ({
    body: { ...body },
    user: { id: userId },
    params: { ...params },
  });

  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn();
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createTransaction", () => {
    it("should successfully create a transaction with user's preferred currency", async () => {
      const mockUser = {
        _id: "user123",
        preferredCurrency: "EUR"
      };
      
      const req = mockRequest(
        {
          amount: 100,
          category: "Groceries",
          type: "expense",
          currency: "USD",
          tags: ["food"],
        },
        "user123"
      );
      const res = mockResponse();

      // Mock the exchange rate API response
      axios.get.mockResolvedValueOnce({
        data: {
          conversion_rates: {
            EUR: 0.85
          }
        }
      });

      User.findById.mockResolvedValue(mockUser);
      checkBudgetLimit.mockResolvedValue(null);
      
      const mockSavedTransaction = {
        _id: "transaction123",
        amount: 85, // Converted amount (example)
        originalAmount: 100,
        originalCurrency: "USD",
        currency: "EUR",
        exchangeRate: 0.85,
        convertedAmount: 85
      };

      Transaction.prototype.save.mockResolvedValue(mockSavedTransaction);

      await createTransaction(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Transaction created successfully",
        transaction: expect.objectContaining({
          amount: 85,
          originalAmount: 100,
          originalCurrency: "USD",
          currency: "EUR",
          exchangeRate: 0.85,
          convertedAmount: 85
        })
      }));
    });

    it("should handle missing user error", async () => {
      const req = mockRequest(
        {
          amount: 100,
          category: "Groceries",
          type: "expense",
          currency: "USD",
        },
        "nonexistentUser"
      );
      const res = mockResponse();

      User.findById.mockResolvedValue(null);

      await createTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found"
      });
    });

    it("should handle transaction creation error", async () => {
      const mockUser = {
        _id: "user123",
        preferredCurrency: "EUR"
      };

      const req = mockRequest(
        {
          amount: 100,
          category: "Groceries",
          type: "expense",
          currency: "USD",
        },
        "user123"
      );
      const res = mockResponse();

      // Mock the exchange rate API to fail
      axios.get.mockRejectedValueOnce(new Error("API Error"));

      User.findById.mockResolvedValue(mockUser);

      await createTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to fetch exchange rate",
        error: "API Error"
      });
    });

    it("should create transaction without conversion when currencies match (USD)", async () => {
      const mockUser = {
        _id: "user123",
        preferredCurrency: "USD"  // User's preferred currency is USD
      };
      
      const req = mockRequest(
        {
          amount: 100,
          category: "Utilities",
          type: "expense",
          currency: "USD",  // Transaction also in USD
          tags: ["electricity", "bill"],
          recurring: {
            isRecurring: true,
            frequency: "monthly",
            nextDueDate: "2025-03-10T00:00:00.000Z",
            endDate: "2025-12-31T00:00:00.000Z"
          }
        },
        "user123"
      );
      const res = mockResponse();

      User.findById.mockResolvedValue(mockUser);
      checkBudgetLimit.mockResolvedValue({
        warning: false,
        message: "No budget set for this category."
      });
      
      const mockSavedTransaction = {
        _id: "transaction123",
        user: "user123",
        amount: 100,  // Amount stays the same
        originalAmount: 100,
        originalCurrency: "USD",
        category: "Utilities",
        type: "expense",
        currency: "USD",
        exchangeRate: 1,  // Exchange rate should be 1 for same currency
        convertedAmount: 100,
        tags: ["electricity", "bill"],
        recurring: {
          isRecurring: true,
          frequency: "monthly",
          nextDueDate: "2025-03-10T00:00:00.000Z",
          endDate: "2025-12-31T00:00:00.000Z"
        },
        date: "2025-03-09T01:37:14.838Z",
        goalId: null
      };

      Transaction.prototype.save.mockResolvedValue(mockSavedTransaction);

      await createTransaction(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Transaction created successfully",
        transaction: {
          _id: "transaction123",
          amount: 100,
          category: "Utilities",
          convertedAmount: 100,
          currency: "USD",
          date: "2025-03-09T01:37:14.838Z",
          exchangeRate: 1,
          goalId: null,
          originalAmount: 100,
          originalCurrency: "USD",
          recurring: {
            endDate: "2025-12-31T00:00:00.000Z",
            frequency: "monthly",
            isRecurring: true,
            nextDueDate: "2025-03-10T00:00:00.000Z"
          },
          tags: ["electricity", "bill"],
          type: "expense",
          user: "user123"
        },
        budgetWarning: {
          warning: false,
          message: "No budget set for this category."
        },
        goalStatusMessage: null,
        expenseWarning: null
      });
    });
  });

  describe("getTransactions", () => {
    it("should return all transactions for a user", async () => {
      const req = mockRequest({}, "user123");
      const res = mockResponse();
      const mockTransactions = [
        { 
          amount: 85,
          originalAmount: 100,
          currency: "USD",
          category: "Groceries"
        }
      ];

      Transaction.find.mockResolvedValue(mockTransactions);

      await getTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTransactions);
    });

    it("should handle error when fetching transactions", async () => {
      const req = mockRequest({}, "user123");
      const res = mockResponse();

      Transaction.find.mockRejectedValue(new Error("Database error"));

      await getTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error fetching transactions",
        error: "Database error"
      });
    });
  });

  describe("updateTransaction", () => {
    it("should update a transaction with currency conversion", async () => {
      const req = mockRequest(
        {
          amount: 100,
          category: "Groceries",
          type: "expense",
          currency: "USD", // Transaction in USD
        },
        "user123",
        { id: "transactionId123" }
      );
      const res = mockResponse();

      // Mock user with EUR as preferred currency
      const mockUser = {
        _id: "user123",
        preferredCurrency: "EUR"
      };

      // Mock exchange rate response (USD to EUR)
      const mockExchangeRateResponse = {
        data: {
          conversion_rates: {
            EUR: 0.85 // 1 USD = 0.85 EUR
          }
        }
      };

      // Mock existing transaction
      const mockExistingTransaction = {
        _id: "transactionId123",
        amount: 100,
        currency: "USD",
        exchangeRate: 1,
        convertedAmount: 100
      };

      // Mock updated transaction
      const mockUpdatedTransaction = {
        _id: "transactionId123",
        amount: 85, // Converted amount (100 USD * 0.85 = 85 EUR)
        originalAmount: 100,
        originalCurrency: "USD",
        currency: "EUR", // Changed to user's preferred currency
        exchangeRate: 0.85,
        convertedAmount: 85,
        category: "Groceries",
        type: "expense"
      };

      // Setup mocks
      User.findById.mockResolvedValue(mockUser);
      Transaction.findById.mockResolvedValue(mockExistingTransaction);
      axios.get.mockResolvedValue(mockExchangeRateResponse);
      Transaction.findByIdAndUpdate.mockResolvedValue(mockUpdatedTransaction);
      checkBudgetLimit.mockResolvedValue({ warning: false, message: "Within budget" });

      await updateTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Transaction updated successfully",
        transaction: expect.objectContaining({
          amount: 85, // Main amount is now the converted amount
          originalAmount: 100,
          originalCurrency: "USD",
          currency: "EUR", // Changed to user's preferred currency
          exchangeRate: 0.85,
          convertedAmount: 85
        }),
        details: {
          originalAmount: 100,
          originalCurrency: "USD",
          convertedAmount: 85,
          finalCurrency: "EUR",
          exchangeRate: 0.85
        }
      });

      // Verify the update call
      expect(Transaction.findByIdAndUpdate).toHaveBeenCalledWith(
        "transactionId123",
        expect.objectContaining({
          amount: 85,
          currency: "EUR",
          originalAmount: 100,
          originalCurrency: "USD",
          convertedAmount: 85,
          exchangeRate: 0.85
        }),
        { new: true }
      );
    });

    it("should handle missing transaction error", async () => {
      const req = mockRequest(
        {
          amount: 150,
          category: "Groceries"
        },
        "user123",
        { id: "nonexistentId" }
      );
      const res = mockResponse();

      Transaction.findById.mockResolvedValue(null);

      await updateTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Transaction not found"
      });
    });

    it("should handle exchange rate fetch error", async () => {
      const req = mockRequest(
        {
          amount: 150,
          category: "Groceries",
          type: "expense",
          currency: "USD",
        },
        "user123",
        { id: "transactionId123" }
      );
      const res = mockResponse();

      const mockUser = {
        _id: "user123",
        preferredCurrency: "EUR"
      };

      const mockTransaction = {
        _id: "transactionId123",
        amount: 100,
        currency: "USD"
      };

      User.findById.mockResolvedValue(mockUser);
      Transaction.findById.mockResolvedValue(mockTransaction);
      axios.get.mockRejectedValue(new Error("API Error"));

      await updateTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error fetching exchange rate"
      });
    });

    it("should update transaction without conversion when currencies match", async () => {
      const req = mockRequest(
        {
          amount: 150,
          category: "Groceries",
          type: "expense",
          currency: "EUR", // Same as user's preferred currency
        },
        "user123",
        { id: "transactionId123" }
      );
      const res = mockResponse();

      const mockUser = {
        _id: "user123",
        preferredCurrency: "EUR"
      };

      const mockTransaction = {
        _id: "transactionId123",
        amount: 100,
        currency: "EUR"
      };

      const mockUpdatedTransaction = {
        _id: "transactionId123",
        amount: 150,
        originalAmount: 150,
        originalCurrency: "EUR",
        currency: "EUR",
        exchangeRate: 1,
        convertedAmount: 150,
        category: "Groceries",
        type: "expense"
      };

      User.findById.mockResolvedValue(mockUser);
      Transaction.findById.mockResolvedValue(mockTransaction);
      Transaction.findByIdAndUpdate.mockResolvedValue(mockUpdatedTransaction);
      checkBudgetLimit.mockResolvedValue({ warning: false, message: "Within budget" });

      await updateTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Transaction updated successfully",
        transaction: {
          _id: "transactionId123",
          amount: 150,
          category: "Groceries",
          convertedAmount: 150,
          currency: "EUR",
          exchangeRate: 1,
          originalAmount: 150,
          originalCurrency: "EUR",
          type: "expense"
        },
        details: {
          originalAmount: 150,
          originalCurrency: "EUR",
          convertedAmount: 150,
          finalCurrency: "EUR",
          exchangeRate: 1
        }
      });
    });
  });

  describe("deleteTransaction", () => {
    it("should delete a transaction successfully", async () => {
      const req = mockRequest({}, "user123", { id: "transactionId123" });
      const res = mockResponse();

      const mockTransaction = { 
        _id: "transactionId123",
        deleteOne: jest.fn().mockResolvedValue({})
      };
      Transaction.findById.mockResolvedValue(mockTransaction);

      await deleteTransaction(req, res);

      expect(mockTransaction.deleteOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Transaction deleted successfully"
      });
    });

    it("should return error if transaction not found", async () => {
      const req = mockRequest({}, "user123", { id: "nonexistentId" });
      const res = mockResponse();

      Transaction.findById.mockResolvedValue(null);

      await deleteTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Transaction not found"
      });
    });
  });
});