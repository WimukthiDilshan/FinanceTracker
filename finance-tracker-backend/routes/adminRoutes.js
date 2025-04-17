const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, updateUser, getAdminOverview } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware'); // To check if user is logged in and is admin
const adminAuth = require('../middleware/adminAuth');



// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  } else {
    return res.status(403).json({ message: "Access denied, Admin only" });
  }
};

// Get all users (Admin only)
router.get('/users', authMiddleware, isAdmin, getAllUsers);

// Update a user (Admin only)
router.put('/users/:id', authMiddleware, isAdmin, updateUser);

// Delete a user (Admin only)
router.delete('/users/:id', authMiddleware, isAdmin, deleteUser);

// Route to get admin overview
router.get('/overview', authMiddleware, adminAuth, getAdminOverview);

module.exports = router;
