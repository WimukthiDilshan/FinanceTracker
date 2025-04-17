# FinanceTracker - Modern Financial Management Solution

![FinanceTracker Logo](client/public/logo.png)

A full-stack financial management application that helps users track expenses, manage budgets, visualize their financial health, and convert currencies in real-time.

## 🌟 Features

### 📊 Dashboard
- Real-time financial overview
- Interactive charts and graphs
- Key financial metrics
- Recent transactions list
- Spending trends visualization

### 💰 Transaction Management
- Add, edit, and delete transactions
- Categorize transactions
- Filter and search functionality
- Transaction history
- Recurring transactions

### 💱 Currency Features
- Real-time currency conversion
- Support for multiple currencies
- Historical rate tracking
- Automatic currency conversion
- Currency preference settings

### 📈 Budget Tracking
- Set budget limits by category
- Track spending against budgets
- Visual progress indicators
- Budget alerts
- Monthly budget planning

### 📊 Analytics
- Spending trends analysis
- Category distribution
- Monthly comparisons
- Custom date range analysis
- Export reports

### ⚙️ User Settings
- Profile management
- Notification preferences
- Language and currency settings
- Security options
- Theme customization

## 🛠️ Tech Stack

### Frontend
- React 18
- Material-UI (MUI)
- Nivo Charts
- React Router
- Axios
- Emotion (Styled Components)

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- bcrypt
- node-cron

### APIs & Services
- Currency Exchange API
- MongoDB Atlas
- JWT for authentication
- WebSocket for real-time updates

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/finance-tracker.git
cd finance-tracker
```

2. Install backend dependencies
```bash
npm install
```

3. Install frontend dependencies
```bash
cd client
npm install
```

4. Create a .env file in the root directory
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

5. Start the development servers

Backend:
```bash
npm run dev
```

Frontend:
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 📁 Project Structure

```
finance-tracker/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── assets/       # Static assets
│   │   └── App.jsx       # Main App component
│   └── public/           # Public assets
├── server/               # Backend Node.js application
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   └── services/        # Business logic
├── tests/               # Test files
└── package.json         # Project dependencies
```

## 🔒 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

## 📝 API Documentation

### Authentication
- POST /api/users/register - Register a new user
- POST /api/users/login - Login user
- GET /api/users/profile - Get user profile

### Transactions
- GET /api/transactions - Get all transactions
- POST /api/transactions - Create a transaction
- PUT /api/transactions/:id - Update a transaction
- DELETE /api/transactions/:id - Delete a transaction

### Budget
- GET /api/budgets - Get all budgets
- POST /api/budgets - Create a budget
- PUT /api/budgets/:id - Update a budget
- DELETE /api/budgets/:id - Delete a budget

### Dashboard
- GET /api/dashboard/overview - Get dashboard overview
- GET /api/dashboard/stats - Get dashboard statistics
- GET /api/dashboard/recent-transactions - Get recent transactions

### Currency
- GET /api/currency/rates - Get current exchange rates
- GET /api/currency/convert - Convert between currencies

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- Material-UI for the component library
- Nivo for the beautiful charts
- MongoDB for the database
- Node.js community for the amazing tools

## 📧 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)
Project Link: [https://github.com/yourusername/finance-tracker](https://github.com/yourusername/finance-tracker)
