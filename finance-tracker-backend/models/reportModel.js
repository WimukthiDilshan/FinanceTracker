const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["income", "expense", "summary"], required: true },
  period: { type: String, enum: ["daily", "weekly", "monthly", "yearly"], required: true },
  category: { type: String },
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
