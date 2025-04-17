const mongoose = require("mongoose");

const GoalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Goal name (Required)
    targetAmount: { type: Number, required: true }, // Target savings amount
    currentAmount: { type: Number, default: 0 }, // Amount saved so far
    deadline: { type: Date, required: true }, // Deadline for the goal
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

module.exports = mongoose.model("Goal", GoalSchema);
