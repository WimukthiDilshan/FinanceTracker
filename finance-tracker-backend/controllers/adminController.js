const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const Budget = require('../models/Budget')

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete a user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent deletion of the admin account
    if (user.isAdmin) {
      return res.status(400).json({ message: "Cannot delete admin user" });
    }

    await User.deleteOne({ _id: req.params.id }); // Instead of user.remove()

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error); // Log the error in the console
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Update a user (Admin only)
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Only allow updating username and isAdmin fields (optional)
    user.username = req.body.username || user.username;
    if (req.body.isAdmin !== undefined) user.isAdmin = req.body.isAdmin;

    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};



/**
 * Admin: Overview of all users, total system activity, and financial summaries
 */
// controllers/adminController.js
const getAdminOverview = async (req, res) => {
  try {
    // Your logic for generating the admin overview
    const users = await User.find();
    const transactions = await Transaction.find();
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    res.status(200).json({
      message: 'Admin Overview',
      usersCount: users.length,
      totalIncome,
      totalExpense,
      totalUsers: users.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching admin overview", error: error.message });
  }
};

module.exports = { getAllUsers, deleteUser, updateUser, getAdminOverview};