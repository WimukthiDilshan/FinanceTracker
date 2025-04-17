const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    index: true // ✅ Faster queries based on userId
  },
  category: { 
    type: String, 
    required: true, 
    trim: true // ✅ Prevents accidental spaces
  },
  amount: { 
    type: Number, 
    required: true, 
    min: [1, "Amount must be greater than zero"] // ✅ Prevents negative or zero amounts
  },
  period: { 
    type: String, 
    enum: ["monthly", "weekly", "daily"], 
    required: true, 
    default: "monthly" // ✅ Default period set to "monthly"
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// ✅ Create an index for better performance
budgetSchema.index({ userId: 1, category: 1, period: 1 }, { unique: true });

const Budget = mongoose.model("Budget", budgetSchema);
module.exports = Budget;
