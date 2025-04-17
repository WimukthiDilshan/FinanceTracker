const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["daily", "weekly", "monthly", "yearly"],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  totalSpending: {
    type: Number,
    required: true,
  },
  categoryBreakdown: [{
    category: String,
    amount: Number,
    percentage: Number,
  }],
  trendData: [{
    date: Date,
    amount: Number,
  }],
  topCategories: [{
    category: String,
    amount: Number,
  }],
  averageSpending: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Report", reportSchema);
