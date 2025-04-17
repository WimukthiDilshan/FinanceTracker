const Transaction = require('../models/Transaction');
const moment = require('moment');
const Report = require("../models/Report");
const { generateReport: generateReportService, getReports: getReportsService, getReportById: getReportByIdService } = require("../services/reportService");

// Function to generate a report
exports.generateReport = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.body;
    const userId = req.user.id;

    // Validate report type
    if (!["daily", "weekly", "monthly", "yearly"].includes(type)) {
      return res.status(400).json({ message: "Invalid report type" });
    }

    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    const start = moment(startDate).startOf("day").toDate();
    const end = moment(endDate).endOf("day").toDate();

    if (moment(end).isBefore(start)) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    const report = await generateReportService(userId, type, start, end);
    res.status(201).json({
      message: "Report generated successfully",
      report,
    });
  } catch (error) {
    console.error("Error in generateReport controller:", error);
    res.status(500).json({ message: "Error generating report", error: error.message });
  }
};

// Admin can get all reports
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find(); // Fetch all reports
    res.status(200).json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Get summary report: Total income vs. expenses by category
exports.getSummaryReport = async (req, res) => {
  try {
    const summary = await Transaction.aggregate([
      {
        $group: {
          _id: { category: "$category", type: "$type" },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.type",
          categories: {
            $push: { category: "$_id.category", totalAmount: "$totalAmount", count: "$count" }
          },
          total: { $sum: "$totalAmount" }
        }
      },
      {
        $project: {
          type: "$_id",
          categories: 1,
          total: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json(summary);
  } catch (error) {
    console.error("Error fetching summary report:", error);
    res.status(500).json({ message: "Failed to generate summary report" });
  }
};

// Get spending trends over time (daily, weekly, or monthly)
exports.getSpendingTrends = async (req, res) => {
  const { startDate, endDate, interval } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Start date and end date are required' });
  }

  try {
    const trends = await Transaction.aggregate([
      {
        $match: {
          createdAt: { 
            $gte: moment(startDate).startOf('day').toDate(), 
            $lte: moment(endDate).endOf('day').toDate() 
          }
        }
      },
      {
        $group: {
          _id: {
            period: { 
              $dateToString: { 
                format: interval === "month" ? "%Y-%m" : "%Y-%m-%d", 
                date: "$createdAt" 
              } 
            },
            type: "$type"
          },
          totalAmount: { $sum: "$amount" }
        }
      },
      {
        $group: {
          _id: "$_id.period",
          totalIncome: {
            $sum: { 
              $cond: [{ $eq: ["$_id.type", "income"] }, "$totalAmount", 0] 
            }
          },
          totalExpenses: {
            $sum: { 
              $cond: [{ $eq: ["$_id.type", "expense"] }, "$totalAmount", 0] 
            }
          }
        }
      },
      {
        $project: {
          period: "$_id",
          totalIncome: 1,
          totalExpenses: 1,
          netBalance: { $subtract: ["$totalIncome", "$totalExpenses"] },
          _id: 0
        }
      },
      { $sort: { period: 1 } }
    ]);

    res.status(200).json(trends);
  } catch (error) {
    console.error("Error fetching spending trends:", error);
    res.status(500).json({ message: "Failed to generate spending trends report" });
  }
};

// Get transactions within a date range
exports.getDateRangeReport = async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Start date and end date are required' });
  }

  try {
    const transactions = await Transaction.find({
      createdAt: { 
        $gte: moment(startDate).startOf('day').toDate(), 
        $lte: moment(endDate).endOf('day').toDate() 
      }
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching date range report:", error);
    res.status(500).json({ message: "Failed to generate date range report" });
  }
};

// Get transactions filtered by category & tags
exports.getFilteredTransactions = async (req, res) => {
  const { startDate, endDate, category, tags } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Start date and end date are required' });
  }

  try {
    const filters = {
      createdAt: { 
        $gte: moment(startDate).startOf('day').toDate(), 
        $lte: moment(endDate).endOf('day').toDate() 
      }
    };
    
    if (category) filters.category = category;
    if (tags) filters.tags = { $in: tags.split(",") };

    const transactions = await Transaction.find(filters);
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching filtered transactions:", error);
    res.status(500).json({ message: "Failed to fetch transactions with filters" });
  }
};

// Get all reports for the user
exports.getReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;

    const reports = await getReportsService(userId, type);
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error in getReports controller:", error);
    res.status(500).json({ message: "Error fetching reports", error: error.message });
  }
};

// Get a specific report by ID
exports.getReportById = async (req, res) => {
  try {
    const userId = req.user.id;
    const reportId = req.params.id;

    const report = await getReportByIdService(reportId, userId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json(report);
  } catch (error) {
    console.error("Error in getReportById controller:", error);
    res.status(500).json({ message: "Error fetching report", error: error.message });
  }
};
