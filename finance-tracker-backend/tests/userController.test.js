const { registerUser, loginUser } = require("../controllers/userController");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Mock the User model
jest.mock("../models/User");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("User Controller", () => {
  
  // Test for user registration
  describe("registerUser", () => {
    it("should successfully register a user", async () => {
      const mockRequest = {
        body: {
          username: "testuser",
          password: "password123",
          isAdmin: false,
        },
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      User.findOne.mockResolvedValue(null); // No user found
      bcrypt.hash.mockResolvedValue("hashedpassword");
      User.prototype.save.mockResolvedValue({});

      await registerUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User registered successfully",
      });
    });

    it("should return error if user already exists", async () => {
      const mockRequest = {
        body: {
          username: "existinguser",
          password: "password123",
        },
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      User.findOne.mockResolvedValue({ username: "existinguser" }); // User exists

      await registerUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User already exists",
      });
    });
  });

  // Test for user login
  describe("loginUser", () => {
    it("should successfully login and return a JWT token", async () => {
      const mockRequest = {
        body: {
          username: "testuser",
          password: "password123",
        },
      };

      const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      const mockUser = {
        username: "testuser",
        password: "hashedpassword",
        isAdmin: false,
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mockToken");

      await loginUser(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith({
        token: "mockToken",
      });
    });

    it("should return error if credentials are invalid", async () => {
      const mockRequest = {
        body: {
          username: "invaliduser",
          password: "wrongpassword",
        },
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      User.findOne.mockResolvedValue(null); // User not found

      await loginUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid credentials",
      });
    });
  });
});
