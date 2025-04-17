const axios = require("axios");


const API_URL = `https://v6.exchangerate-api.com/v6/2f5358bf7df61b14223a8185/latest/USD`;

const getExchangeRates = async (Currency) => {
  try {
    const response = await axios.get(`${API_URL}${Currency}`);
    return response.data.conversion_rates;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    throw new Error("Unable to fetch exchange rates");
  }
};

module.exports = { getExchangeRates };
