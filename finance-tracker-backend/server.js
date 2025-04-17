const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");
const cron = require("node-cron");
const dashboardRoutes = require("./routes/dashboard");

// Import Routes
const budgetRoutes = require("./routes/budgetRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const userRoutes = require("./routes/userRoutes");
const reportRoutes = require("./routes/reportRoutes");
const goalRoutes = require("./routes/goalRoutes");
const currencyRoutes = require("./routes/currencyRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Import Admin Routes
const adminRoutes = require("./routes/adminRoutes");

// Import services
const { processRecurringTransactions } = require("./services/recurringTransactionService");

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Connect to MongoDB (only in non-test environments)
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// Middleware configuration
app.use(express.json());
app.use(cors());
app.use(helmet()); // Security headers
app.use(morgan("dev")); // Logging requests

// Routes
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/currency", currencyRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", dashboardRoutes);

// Admin routes (protected by admin verification middleware)
app.use("/api/admin", adminRoutes);

// 🕒 Schedule a daily job to process recurring transactions (Runs at midnight)
cron.schedule("0 0 * * *", async () => {
  console.log("🔄 Processing recurring transactions...");
  await processRecurringTransactions();
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// Handle Uncaught Exceptions & Unhandled Rejections
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception! Shutting down...");
  console.error(err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection! Shutting down...");
  console.error(err);
  process.exit(1);
});

// Start Server (only in non-test environments)
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}

// Graceful Shutdown Handling
process.on("SIGTERM", () => {
  console.log("🚀 SIGTERM received. Closing server gracefully...");
  server.close(() => {
    console.log("💾 Closing database connection...");
    process.exit(0);
  });
});

module.exports = app; // Export app for testing
