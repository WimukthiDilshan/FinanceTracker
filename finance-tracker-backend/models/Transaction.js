const mongoose = require("mongoose");
const axios = require("axios");
const User = require("./User");

// Load exchange rate API from environment
const EXCHANGE_RATE_API = process.env.EXCHANGE_RATE_API || "https://v6.exchangerate-api.com/v6/2f5358bf7df61b14223a8185/latest/";

// Function to fetch exchange rates
const getExchangeRate = async (fromCurrency, toCurrency) => {
  try {
    console.log(`Fetching exchange rate from ${fromCurrency} to ${toCurrency}`);
    const response = await axios.get(`${EXCHANGE_RATE_API}${fromCurrency}`);
    if (response.data && response.data.conversion_rates) {
      return response.data.conversion_rates[toCurrency] || 1;
    } else {
      console.error("Invalid API response:", response.data);
      return 1;
    }
  } catch (error) {
    console.error("Error fetching exchange rate:", error.response?.data || error.message);
    return 1;
  }
};

const transactionSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    originalAmount: { type: Number, required: true },
    originalCurrency: { type: String, required: true, uppercase: true },
    category: { type: String, required: true },
    type: { type: String, enum: ["income", "expense", "savings"], required: true },
    currency: { type: String, required: true, uppercase: true },
    exchangeRate: { type: Number, required: true, default: 1 },
    convertedAmount: { type: Number, default: null },
    tags: { type: [String], default: [] },
    recurring: {
      isRecurring: { type: Boolean, default: false },
      frequency: { type: String, enum: ["daily", "weekly", "monthly"], default: null },
      nextDueDate: { type: Date, default: null },
      endDate: { type: Date, default: null },
    },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: "Goal" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Middleware to handle exchange rate and recurring transactions
transactionSchema.pre("save", async function (next) {
  try {
    // Get user's preferred currency
    const user = await User.findById(this.user);
    const preferredCurrency = user.preferredCurrency;

    // Set original values
    this.originalAmount = this.amount;
    this.originalCurrency = this.currency;

    // Only convert if transaction currency is different from preferred currency
    if (this.currency !== preferredCurrency) {
      this.exchangeRate = await getExchangeRate(this.currency, preferredCurrency);
      this.convertedAmount = this.amount * this.exchangeRate;
      this.amount = this.convertedAmount; // Store the converted amount in preferred currency
      this.currency = preferredCurrency; // Update the currency to preferred currency
    } else {
      this.exchangeRate = 1;
      this.convertedAmount = this.amount;
    }

    if (this.recurring.isRecurring) {
      this.recurring.frequency = this.recurring.frequency || "monthly";
      this.recurring.nextDueDate = this.recurring.nextDueDate || new Date();
      this.recurring.endDate = this.recurring.endDate || null;
    } else {
      this.recurring = { isRecurring: false, frequency: null, nextDueDate: null, endDate: null };
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Transaction", transactionSchema);
