const Goal = require("../models/Goal");

/**
 * Create a new goal
 */
exports.createGoal = async (req, res) => {
    try {
        const { name, targetAmount, deadline } = req.body;
        const userId = req.user.id;

        if (!name || !targetAmount || !deadline) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newGoal = new Goal({
            user: userId,
            name,
            targetAmount,
            currentAmount: 0,
            deadline,
        });

        await newGoal.save();
        res.status(201).json({ message: "Goal created successfully", goal: newGoal });
    } catch (error) {
        res.status(500).json({ message: "Failed to create goal", error: error.message });
    }
};

/**
 * Get all goals for a user
 */
exports.getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ user: req.user.id });
        res.status(200).json(goals);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch goals", error: error.message });
    }
};

/**
 * Get a specific goal by ID
 */
exports.getGoalById = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.goalId);
        if (!goal || goal.user.toString() !== req.user.id) {
            return res.status(404).json({ message: "Goal not found" });
        }
        res.status(200).json(goal);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving goal", error: error.message });
    }
};

/**
 * Update a goal
 */
exports.updateGoal = async (req, res) => {
    try {
        const { name, targetAmount, deadline } = req.body;
        let goal = await Goal.findById(req.params.goalId);

        if (!goal || goal.user.toString() !== req.user.id) {
            return res.status(404).json({ message: "Goal not found" });
        }

        goal.name = name || goal.name;
        goal.targetAmount = targetAmount || goal.targetAmount;
        goal.deadline = deadline || goal.deadline;

        await goal.save();
        res.status(200).json({ message: "Goal updated successfully", goal });
    } catch (error) {
        res.status(500).json({ message: "Failed to update goal", error: error.message });
    }
};

/**
 * Delete a goal
 */
exports.deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.goalId);
        if (!goal || goal.user.toString() !== req.user.id) {
            return res.status(404).json({ message: "Goal not found" });
        }

        await goal.deleteOne();
        res.status(200).json({ message: "Goal deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete goal", error: error.message });
    }
};

/**
 * Allocate savings to a goal
 */
exports.allocateSavings = async (req, res) => {
    try {
        const { amount } = req.body;
        const goal = await Goal.findById(req.params.goalId);

        if (!goal || goal.user.toString() !== req.user.id) {
            return res.status(404).json({ message: "Goal not found" });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid savings amount" });
        }

        goal.currentAmount += amount;

        // Check if the goal is achieved
        let goalStatusMessage = "Savings allocated successfully";
        if (goal.currentAmount >= goal.targetAmount) {
            goal.currentAmount = goal.targetAmount;
            goalStatusMessage = "🎉 Your goal is successful! 🎉";
        }

        await goal.save();

        res.status(200).json({ message: goalStatusMessage, goal });
    } catch (error) {
        res.status(500).json({ message: "Failed to allocate savings", error: error.message });
    }
};
