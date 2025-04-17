const { getAllUsers, deleteUser, updateUser, getAdminOverview } = require("../controllers/adminController");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// Mock the dependencies
jest.mock("../models/User");
jest.mock("../models/Transaction");

describe("Admin Controller", () => {
  
  // Test: Get all users
  describe("getAllUsers", () => {
    it("should return all users", async () => {
      const mockUsers = [{ username: "User1" }, { username: "User2" }];
      User.find.mockResolvedValue(mockUsers);

      const req = {};
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

      await getAllUsers(req, res);

      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it("should handle server error", async () => {
      User.find.mockRejectedValue(new Error("Database error"));

      const req = {};
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

      await getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error", error: expect.anything() });
    });
  });

  // Test: Delete a user
  describe("deleteUser", () => {
    it("should delete a user successfully", async () => {
      const mockUser = { _id: "123", isAdmin: false };
      User.findById.mockResolvedValue(mockUser);
      User.deleteOne.mockResolvedValue({});

      const req = { params: { id: "123" } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

      await deleteUser(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: "User deleted successfully" });
    });

    it("should not delete an admin user", async () => {
      const mockUser = { _id: "123", isAdmin: true };
      User.findById.mockResolvedValue(mockUser);

      const req = { params: { id: "123" } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Cannot delete admin user" });
    });

    it("should handle user not found", async () => {
      User.findById.mockResolvedValue(null);

      const req = { params: { id: "999" } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
  });

  // Test: Update a user
  describe("updateUser", () => {
    it("should update a user successfully", async () => {
      const mockUser = { _id: "123", username: "oldUser", save: jest.fn() };
      User.findById.mockResolvedValue(mockUser);

      const req = { params: { id: "123" }, body: { username: "newUser" } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

      await updateUser(req, res);

      expect(mockUser.username).toBe("newUser");
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: "User updated successfully", user: mockUser });
    });

    it("should return 404 if user is not found", async () => {
      User.findById.mockResolvedValue(null);

      const req = { params: { id: "999" } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
  });

  // Test: Get admin overview
  describe("getAdminOverview", () => {
    it("should return admin overview", async () => {
      const mockUsers = [{}, {}]; // Two users
      const mockTransactions = [
        { type: "income", amount: 1000 },
        { type: "expense", amount: 500 },
      ];

      User.find.mockResolvedValue(mockUsers);
      Transaction.find.mockResolvedValue(mockTransactions);

      const req = {};
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

      await getAdminOverview(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Admin Overview",
        usersCount: 2,
        totalIncome: 1000,
        totalExpense: 500,
        totalUsers: 2,
      });
    });

    it("should handle error in fetching admin overview", async () => {
      User.find.mockRejectedValue(new Error("Error fetching users"));

      const req = {};
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

      await getAdminOverview(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Error fetching admin overview", error: expect.anything() });
    });
  });

});
