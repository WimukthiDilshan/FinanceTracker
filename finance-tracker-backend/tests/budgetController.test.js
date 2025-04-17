const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const budgetRoutes = require("../routes/budgetRoutes");
const Budget = require("../models/Budget");
const { createBudget, getBudgets, updateBudget, deleteBudget } = require("../controllers/budgetController");

jest.mock("../models/Budget");

const app = express();
app.use(express.json());
app.use("/api/budgets", budgetRoutes);

describe("Budget Controller Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create a new budget", async () => {
    const req = {
      body: { category: "Food", amount: 500, period: "Monthly" },
      user: { id: "user123" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    Budget.create.mockResolvedValue({
      _id: "budget123",
      userId: "user123",
      category: "Food",
      amount: 500,
      period: "Monthly",
    });

    await createBudget(req, res);
    
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Budget created successfully",
      budget: expect.objectContaining({ category: "Food", amount: 500, period: "Monthly" })
    });
  });

  test("should fetch user budgets", async () => {
    const req = { user: { id: "user123" } };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    
    Budget.find.mockResolvedValue([{ _id: "budget123", category: "Food", amount: 500, period: "Monthly" }]);

    await getBudgets(req, res);

    expect(res.json).toHaveBeenCalledWith([{ _id: "budget123", category: "Food", amount: 500, period: "Monthly" }]);
  });

  test("should update a budget", async () => {
    const req = { params: { id: "budget123" }, body: { category: "Transport", amount: 300, period: "Weekly" } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    Budget.findByIdAndUpdate.mockResolvedValue({ _id: "budget123", category: "Transport", amount: 300, period: "Weekly" });

    await updateBudget(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Budget updated successfully",
      budget: expect.objectContaining({ category: "Transport", amount: 300, period: "Weekly" })
    });
  });

  test("should delete a budget", async () => {
    const req = { params: { id: "budget123" } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    Budget.findByIdAndDelete.mockResolvedValue({ _id: "budget123" });

    await deleteBudget(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: "Budget deleted successfully" });
  });
});
