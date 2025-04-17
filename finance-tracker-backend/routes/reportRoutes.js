const express = require('express');
const router = express.Router();
const reportController = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");
const adminAuth = require("../middleware/adminAuth");

// All routes require authentication
router.use(authMiddleware);

// Generate a new report
router.post("/generate", reportController.generateReport);

// Get all reports for the user
router.get("/", reportController.getReports);

// Get a specific report by ID
router.get("/:id", reportController.getReportById);

// Admin routes
router.get("/admin/all", adminAuth, reportController.getAllReports);
router.get("/admin/summary", adminAuth, reportController.getSummaryReport);
router.get("/admin/spending-trends", adminAuth, reportController.getSpendingTrends);
router.get("/admin/date-range", adminAuth, reportController.getDateRangeReport);
router.get("/admin/filtered", adminAuth, reportController.getFilteredTransactions);

module.exports = router;
