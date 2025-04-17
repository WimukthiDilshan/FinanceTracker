const { getDashboardSummary } = require("../controllers/dashboardController");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Goal = require("../models/Goal");
const User = require("../models/User");

// Mock the models
jest.mock("../models/Transaction");
jest.mock("../models/Budget");
jest.mock("../models/Goal");
jest.mock("../models/User");

describe("Dashboard Controller", () => {
  // Mock request and response
  const mockRequest = (userId = "user123") => ({
    user: { id: userId }
  });

  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getDashboardSummary", () => {
    it("should return complete dashboard summary", async () => {
      // Mock user
      const mockUser = {
        _id: "user123",
        preferredCurrency: "EUR"
      };

      // Mock transactions
      const mockTransactions = [
        {
          type: "income",
          amount: 1000,
          convertedAmount: 850,
          category: "Salary",
          currency: "USD",
          originalAmount: 1000,
          originalCurrency: "USD",
          createdAt: new Date("2024-03-09"),
          toObject: () => ({
            type: "income",
            amount: 1000,
            convertedAmount: 850,
            category: "Salary",
            currency: "USD",
            originalAmount: 1000,
            originalCurrency: "USD",
            createdAt: new Date("2024-03-09")
          })
        },
        {
          type: "expense",
          amount: 500,
          convertedAmount: 425,
          category: "Food",
          currency: "USD",
          originalAmount: 500,
          originalCurrency: "USD",
          createdAt: new Date("2024-03-08"),
          toObject: () => ({
            type: "expense",
            amount: 500,
            convertedAmount: 425,
            category: "Food",
            currency: "USD",
            originalAmount: 500,
            originalCurrency: "USD",
            createdAt: new Date("2024-03-08")
          })
        }
      ];

      // Mock goals
      const mockGoals = [
        {
          name: "Vacation",
          targetAmount: 1000,
          currentAmount: 500
        }
      ];

      // Mock budgets
      const mockBudgets = [
        {
          category: "Food",
          amount: 600
        }
      ];

      // Setup mocks
      User.findById.mockResolvedValue(mockUser);
      Transaction.find.mockResolvedValue(mockTransactions);
      Goal.find.mockResolvedValue(mockGoals);
      Budget.find.mockResolvedValue(mockBudgets);

      const req = mockRequest();
      const res = mockResponse();

      await getDashboardSummary(req, res);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          summary: expect.objectContaining({
            totalIncome: 850,
            totalExpense: 425,
            netBalance: 425,
            currency: "EUR"
          }),
          goalsProgress: expect.arrayContaining([
            expect.objectContaining({
              name: "Vacation",
              targetAmount: 1000,
              currentAmount: 500,
              progress: 50,
              currency: "EUR"
            })
          ]),
          budgets: expect.arrayContaining([
            expect.objectContaining({
              category: "Food",
              budgetLimit: 600,
              currentSpend: 425,
              remainingBudget: 175,
              percentageUsed: expect.any(Number),
              status: expect.any(String),
              currency: "EUR"
            })
          ]),
          recentTransactions: expect.arrayContaining([
            expect.objectContaining({
              type: "income",
              convertedAmount: 850,
              originalAmount: 1000,
              originalCurrency: "USD",
              preferredCurrency: "EUR"
            }),
            expect.objectContaining({
              type: "expense",
              convertedAmount: 425,
              originalAmount: 500,
              originalCurrency: "USD",
              preferredCurrency: "EUR"
            })
          ])
        })
      );
    });

    it("should handle missing user error", async () => {
      User.findById.mockResolvedValue(null);

      const req = mockRequest();
      const res = mockResponse();

      await getDashboardSummary(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found"
      });
    });

    it("should handle empty data", async () => {
      const mockUser = {
        _id: "user123",
        preferredCurrency: "EUR"
      };

      User.findById.mockResolvedValue(mockUser);
      Transaction.find.mockResolvedValue([]);
      Goal.find.mockResolvedValue([]);
      Budget.find.mockResolvedValue([]);

      const req = mockRequest();
      const res = mockResponse();

      await getDashboardSummary(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          summary: expect.objectContaining({
            totalIncome: 0,
            totalExpense: 0,
            netBalance: 0,
            currency: "EUR"
          }),
          goalsProgress: [],
          budgets: [],
          recentTransactions: []
        })
      );
    });

    it("should handle database error", async () => {
      User.findById.mockRejectedValue(new Error("Database error"));

      const req = mockRequest();
      const res = mockResponse();

      await getDashboardSummary(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Error fetching dashboard summary",
          error: expect.any(String)
        })
      );
    });

    it("should calculate budget status correctly", async () => {
      const mockUser = {
        _id: "user123",
        preferredCurrency: "EUR"
      };

      const mockTransactions = [
        {
          type: "expense",
          amount: 900,
          convertedAmount: 900,
          category: "Food",
          currency: "EUR",
          toObject: () => ({
            type: "expense",
            amount: 900,
            convertedAmount: 900,
            category: "Food",
            currency: "EUR"
          })
        }
      ];

      const mockBudgets = [
        {
          category: "Food",
          amount: 1000
        }
      ];

      User.findById.mockResolvedValue(mockUser);
      Transaction.find.mockResolvedValue(mockTransactions);
      Goal.find.mockResolvedValue([]);
      Budget.find.mockResolvedValue(mockBudgets);

      const req = mockRequest();
      const res = mockResponse();

      await getDashboardSummary(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          budgets: expect.arrayContaining([
            expect.objectContaining({
              category: "Food",
              budgetLimit: 1000,
              currentSpend: 900,
              remainingBudget: 100,
              percentageUsed: 90,
              status: "WARNING",
              currency: "EUR"
            })
          ])
        })
      );
    });
  });
});
