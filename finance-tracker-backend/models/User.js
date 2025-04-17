const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['expense_warning', 'budget_warning', 'goal_achievement']
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },  // Use isAdmin instead of role
  preferredCurrency: {
    type: String,
    required: true,
    default: "USD",
    uppercase: true,
  },
  notifications: [NotificationSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model("User", UserSchema);
