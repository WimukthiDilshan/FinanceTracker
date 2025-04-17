const express = require("express");
const router = express.Router();
const {
    createGoal,
    getGoals,
    getGoalById,
    updateGoal,
    deleteGoal,
    allocateSavings
} = require("../controllers/goalController");
const authMiddleware = require("../middleware/authMiddleware");

// Goal Routes
router.post("/", authMiddleware, createGoal); // Create a goal
router.get("/", authMiddleware, getGoals); // Get all goals
router.get("/:goalId", authMiddleware, getGoalById); // Get a specific goal
router.put("/:goalId", authMiddleware, updateGoal); // Update a goal
router.delete("/:goalId", authMiddleware, deleteGoal); // Delete a goal
router.post("/:goalId/allocate", authMiddleware, allocateSavings); // Allocate savings to a goal

module.exports = router;
