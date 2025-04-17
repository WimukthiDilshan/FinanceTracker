# Finance Tracker Frontend

A modern and intuitive frontend for the Finance Tracker application built with React, Vite, and Material-UI.

## Features

- 📊 Interactive Dashboard with real-time statistics
- 💰 Transaction management
- 📈 Budget tracking and allocation
- 📊 Advanced analytics and visualizations
- ⚙️ User settings and preferences
- 📱 Responsive design for all devices

## Tech Stack

- React 18
- Vite
- Material-UI (MUI)
- React Router
- Nivo Charts
- Axios

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the client directory:
   ```bash
   cd client
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Development

To start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

### Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
# or
yarn preview
```

## Project Structure

```
client/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/         # Page components
│   ├── assets/        # Static assets
│   ├── App.jsx        # Main App component
│   └── main.jsx       # Entry point
├── public/            # Public assets
└── package.json       # Dependencies and scripts
```

## Features in Detail

### Dashboard
- Overview of financial status
- Key metrics and statistics
- Interactive charts and graphs
- Recent transactions

### Transactions
- Add, edit, and delete transactions
- Categorize transactions
- Filter and search functionality
- Transaction history

### Budget
- Set budget limits by category
- Track spending against budgets
- Visual progress indicators
- Budget alerts

### Analytics
- Spending trends
- Category distribution
- Monthly comparisons
- Custom date range analysis

### Settings
- User profile management
- Notification preferences
- Language and currency settings
- Security options

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
