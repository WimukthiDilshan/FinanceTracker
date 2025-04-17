const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

// Protected route to get dashboard summary for Regular Users
router.get('/dashboard', authMiddleware, dashboardController.getDashboardSummary);

module.exports = router;
