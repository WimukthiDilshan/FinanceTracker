import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const authService = {
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Transaction services
export const transactionService = {
  getAll: () => api.get('/transactions'),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
};

// Budget services
export const budgetService = {
  getAll: () => api.get('/budgets'),
  getById: (id) => api.get(`/budgets/${id}`),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
};

// Dashboard services
export const dashboardService = {
  getOverview: () => api.get('/dashboard/overview'),
  getStats: () => api.get('/dashboard/stats'),
  getRecentTransactions: () => api.get('/dashboard/recent-transactions'),
};

// Report services
export const reportService = {
  getMonthlyReport: (month, year) => api.get(`/reports/monthly?month=${month}&year=${year}`),
  getCategoryReport: (startDate, endDate) => api.get(`/reports/category?startDate=${startDate}&endDate=${endDate}`),
};

// Goal services
export const goalService = {
  getAll: () => api.get('/goals'),
  getById: (id) => api.get(`/goals/${id}`),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
};

// Currency services
export const currencyService = {
  getRates: () => api.get('/currency/rates'),
  convert: (amount, from, to) => api.get(`/currency/convert?amount=${amount}&from=${from}&to=${to}`),
};

// Notification services
export const notificationService = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export default api; 