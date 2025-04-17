const Transaction = require("../models/Transaction");
const moment = require("moment");
//const sendNotification = require("./notificationService");

/**
 * Process all recurring transactions that are due
 * Creates new transactions for each recurring transaction that is due
 * Updates next due dates and handles end dates
 */
const processRecurringTransactions = async () => {
  try {
    const today = moment().startOf("day").toDate();

    // Find all recurring transactions that are due today or earlier (missed)
    const recurringTransactions = await Transaction.find({
      "recurring.isRecurring": true,
      "recurring.nextDueDate": { $lte: today }
    });

    for (const transaction of recurringTransactions) {
      await processTransaction(transaction, today);
    }

    console.log("🔄 Recurring transactions processed successfully!");
  } catch (error) {
    console.error("❌ Error processing recurring transactions:", error);
    throw error; // Propagate error for better error handling
  }
};

/**
 * Process a single recurring transaction
 * @param {Object} transaction - The transaction to process
 * @param {Date} today - Today's date
 */
const processTransaction = async (transaction, today) => {
  let nextDueDate = moment(transaction.recurring.nextDueDate);

  // Generate missed transactions (if any)
  while (nextDueDate.isBefore(today) || nextDueDate.isSame(today, "day")) {
    // Create a new transaction entry for the missed date
    const newTransaction = new Transaction({
      user: transaction.user,
      amount: transaction.amount,
      category: transaction.category,
      type: transaction.type,
      currency: transaction.currency,
      originalAmount: transaction.originalAmount,
      originalCurrency: transaction.originalCurrency,
      exchangeRate: transaction.exchangeRate,
      convertedAmount: transaction.convertedAmount,
      tags: transaction.tags,
      createdAt: nextDueDate.toDate(),
      recurring: transaction.recurring // Keep recurring info
    });

    await newTransaction.save();

    // Send notification
    //const message = `✅ Your recurring ${transaction.category} transaction of $${transaction.amount} has been processed.`;
    //await sendNotification(transaction.user, message);

    // Move to the next due date based on frequency
    nextDueDate = calculateNextDueDate(nextDueDate, transaction.recurring.frequency);

    // Stop if end date is reached
    if (shouldStopRecurring(transaction, nextDueDate)) {
      await Transaction.findByIdAndUpdate(transaction._id, { "recurring.isRecurring": false });
      break; // Stop processing further occurrences
    }
  }

  // Update the next due date in the database
  await Transaction.findByIdAndUpdate(transaction._id, { "recurring.nextDueDate": nextDueDate.toDate() });
};

/**
 * Calculate the next due date based on frequency
 * @param {moment} currentDate - Current due date
 * @param {string} frequency - Frequency of recurrence (daily, weekly, monthly)
 * @returns {moment} Next due date
 */
const calculateNextDueDate = (currentDate, frequency) => {
  switch (frequency) {
    case "daily":
      return currentDate.clone().add(1, "day");
    case "weekly":
      return currentDate.clone().add(1, "week");
    case "monthly":
      return currentDate.clone().add(1, "month");
    default:
      throw new Error(`Invalid frequency: ${frequency}`);
  }
};

/**
 * Check if recurring transaction should stop
 * @param {Object} transaction - The transaction to check
 * @param {moment} nextDueDate - Next calculated due date
 * @returns {boolean} Whether to stop recurring
 */
const shouldStopRecurring = (transaction, nextDueDate) => {
  return transaction.recurring.endDate && 
         moment(transaction.recurring.endDate).isBefore(nextDueDate);
};

module.exports = {
  processRecurringTransactions,
  processTransaction, // Exported for testing
  calculateNextDueDate, // Exported for testing
  shouldStopRecurring // Exported for testing
}; 