const express = require("express");
const { getExchangeRates } = require("../services/currencyService");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get exchange rates for a specific currency
router.get("/rates/:baseCurrency", authMiddleware, async (req, res) => {
  try {
    const { baseCurrency } = req.params;
    const rates = await getExchangeRates(baseCurrency.toUpperCase());
    res.status(200).json({ baseCurrency, rates });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch exchange rates", error: error.message });
  }
});

module.exports = router;
