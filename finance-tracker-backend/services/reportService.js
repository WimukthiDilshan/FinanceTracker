const Transaction = require("../models/Transaction");
const Report = require("../models/Report");
const moment = require("moment");

const generateReport = async (userId, type, startDate, endDate) => {
  try {
    // Get transactions for the specified period
    const transactions = await Transaction.find({
      user: userId,
      type: "expense",
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    console.log("Found transactions:", transactions.length);
    console.log("Date range:", { startDate, endDate });

    // Calculate total spending using convertedAmount if available, otherwise use amount
    const totalSpending = transactions.reduce((sum, t) => {
      const transactionAmount = t.convertedAmount !== null ? t.convertedAmount : t.amount;
      console.log("Transaction amount:", transactionAmount, "Original:", t.amount, "Converted:", t.convertedAmount);
      return sum + (transactionAmount || 0);
    }, 0);

    console.log("Total spending calculated:", totalSpending);

    // Calculate category breakdown
    const categoryBreakdown = {};
    transactions.forEach((t) => {
      if (!categoryBreakdown[t.category]) {
        categoryBreakdown[t.category] = 0;
      }
      const transactionAmount = t.convertedAmount !== null ? t.convertedAmount : t.amount;
      categoryBreakdown[t.category] += (transactionAmount || 0);
    });

    // Convert category breakdown to array with percentages
    const categoryBreakdownArray = Object.entries(categoryBreakdown).map(
      ([category, amount]) => ({
        category,
        amount,
        percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
      })
    );

    // Sort categories by amount
    categoryBreakdownArray.sort((a, b) => b.amount - a.amount);

    // Get top categories (top 5)
    const topCategories = categoryBreakdownArray.slice(0, 5);

    // Generate trend data based on report type
    const trendData = [];
    let currentDate = moment(startDate);
    const endMoment = moment(endDate);

    while (currentDate.isSameOrBefore(endMoment)) {
      const dayTransactions = transactions.filter((t) =>
        moment(t.date).isSame(currentDate, "day")
      );
      const dayTotal = dayTransactions.reduce((sum, t) => {
        const transactionAmount = t.convertedAmount !== null ? t.convertedAmount : t.amount;
        return sum + (transactionAmount || 0);
      }, 0);

      trendData.push({
        date: currentDate.toDate(),
        amount: dayTotal,
      });

      currentDate.add(1, "day");
    }

    // Calculate average spending
    const numberOfDays = moment(endDate).diff(moment(startDate), "days") + 1;
    const averageSpending = totalSpending / numberOfDays;

    // Create and save the report
    const report = new Report({
      user: userId,
      type,
      startDate,
      endDate,
      totalSpending,
      categoryBreakdown: categoryBreakdownArray,
      trendData,
      topCategories,
      averageSpending,
    });

    await report.save();
    return report;
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
};

const getReports = async (userId, type = null) => {
  try {
    const query = { user: userId };
    if (type) {
      query.type = type;
    }
    return await Report.find(query).sort({ createdAt: -1 });
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
};

const getReportById = async (reportId, userId) => {
  try {
    return await Report.findOne({ _id: reportId, user: userId });
  } catch (error) {
    console.error("Error fetching report:", error);
    throw error;
  }
};

module.exports = {
  generateReport,
  getReports,
  getReportById,
}; 