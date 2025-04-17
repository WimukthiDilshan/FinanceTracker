const express = require("express");
const router = express.Router();
const { getNotifications, clearUserNotifications } = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

// Get user's notifications
router.get("/", authMiddleware, getNotifications);

// Clear user's notifications
router.delete("/clear", authMiddleware, clearUserNotifications);

module.exports = router; 