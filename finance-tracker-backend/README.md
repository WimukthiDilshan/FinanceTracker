# Finance Tracker Backend

A robust backend API for financial management and tracking.

## Features

- User Authentication & Authorization
- Transaction Management
- Budget Tracking
- Financial Analytics
- Currency Conversion
- Real-time Notifications
- Data Export & Reporting

## Tech Stack

- Node.js
- Express.js
- MongoDB
- JWT Authentication
- RESTful API Architecture

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/finance-tracker-backend.git
cd finance-tracker-backend
```

2. Install dependencies
```bash
npm install
```

3. Create a .env file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

4. Start the server
```bash
# Development
npm run dev

# Production
npm start
```

## API Documentation

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout
- GET /api/auth/me - Get current user

### Transactions
- GET /api/transactions - Get all transactions
- POST /api/transactions - Create a new transaction
- GET /api/transactions/:id - Get a specific transaction
- PUT /api/transactions/:id - Update a transaction
- DELETE /api/transactions/:id - Delete a transaction

### Budgets
- GET /api/budgets - Get all budgets
- POST /api/budgets - Create a new budget
- GET /api/budgets/:id - Get a specific budget
- PUT /api/budgets/:id - Update a budget
- DELETE /api/budgets/:id - Delete a budget

### Analytics
- GET /api/analytics/overview - Get financial overview
- GET /api/analytics/trends - Get spending trends
- GET /api/analytics/categories - Get category-wise analysis

## Testing

Run the test suite:
```bash
npm test
```

## License

This project is licensed under the ISC License. 