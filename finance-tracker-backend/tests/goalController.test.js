const { createGoal, getGoals, getGoalById, updateGoal, deleteGoal } = require("../controllers/goalController");
const Goal = require("../models/Goal");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Mock the models
jest.mock("../models/Goal");
jest.mock("../models/User");

describe("Goal Controller Tests", () => {
  let mockUser;
  let mockGoal;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create mock user
    mockUser = {
      _id: "user123",
      username: "testuser"
    };

    // Create mock goal with save method
    mockGoal = {
      _id: "goal123",
      name: "New Car",
      targetAmount: 5000,
      deadline: "2025-12-31",
      user: mockUser._id,
      currentAmount: 0,
      toString: jest.fn().mockReturnValue(mockUser._id),
      save: jest.fn().mockResolvedValue(this)
    };

    // Create mock request and response
    mockReq = {
      user: { id: mockUser._id },
      body: {},
      params: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe("createGoal", () => {
    it("should create a new goal", async () => {
      mockReq.body = {
        name: "New Car",
        targetAmount: 5000,
        deadline: "2025-12-31"
      };

      // Create a mock goal instance with save method
      const mockGoalInstance = {
        ...mockGoal,
        save: jest.fn().mockResolvedValue(mockGoal)
      };

      // Mock the Goal constructor to return our mock instance
      Goal.mockImplementation(() => mockGoalInstance);

      await createGoal(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Goal created successfully",
        goal: expect.objectContaining({
          _id: mockGoal._id,
          name: mockGoal.name,
          targetAmount: mockGoal.targetAmount,
          deadline: mockGoal.deadline,
          user: mockGoal.user,
          currentAmount: mockGoal.currentAmount
        })
      });
    });
  });

  describe("getGoals", () => {
    it("should get all goals for a user", async () => {
      Goal.find.mockResolvedValue([mockGoal]);

      await getGoals(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith([mockGoal]);
    });
  });

  describe("getGoalById", () => {
    it("should get a goal by ID", async () => {
      mockReq.params.goalId = mockGoal._id;
      Goal.findById.mockResolvedValue(mockGoal);

      await getGoalById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockGoal);
    });

    it("should return 404 if goal not found", async () => {
      mockReq.params.goalId = "nonexistent";
      Goal.findById.mockResolvedValue(null);

      await getGoalById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Goal not found"
      });
    });
  });

  describe("updateGoal", () => {
    it("should update a goal", async () => {
      mockReq.params.goalId = mockGoal._id;
      mockReq.body = {
        name: "Updated Goal",
        targetAmount: 6000
      };

      // Create an updated version of the goal
      const updatedGoal = {
        ...mockGoal,
        name: "Updated Goal",
        targetAmount: 6000
      };

      // Mock findById to return our mock goal
      Goal.findById.mockResolvedValue(mockGoal);
      // Mock save to return the updated goal
      mockGoal.save.mockResolvedValue(updatedGoal);

      await updateGoal(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Goal updated successfully",
        goal: expect.objectContaining({
          name: "Updated Goal",
          targetAmount: 6000
        })
      });
    });
  });

  describe("deleteGoal", () => {
    it("should delete a goal", async () => {
      mockReq.params.goalId = mockGoal._id;
      Goal.findById.mockResolvedValue(mockGoal);
      mockGoal.deleteOne = jest.fn().mockResolvedValue({});

      await deleteGoal(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Goal deleted successfully"
      });
    });
  });
});
