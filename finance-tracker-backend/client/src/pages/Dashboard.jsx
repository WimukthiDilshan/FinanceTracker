import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Savings,
} from '@mui/icons-material';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { dashboardService } from '../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    overview: null,
    stats: null,
    recentTransactions: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [overview, stats, recentTransactions] = await Promise.all([
          dashboardService.getOverview(),
          dashboardService.getStats(),
          dashboardService.getRecentTransactions(),
        ]);

        setDashboardData({
          overview: overview.data,
          stats: stats.data,
          recentTransactions: recentTransactions.data,
        });
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const { overview, stats, recentTransactions } = dashboardData;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'primary.light',
              color: 'white',
            }}
          >
            <AccountBalance sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Total Balance</Typography>
            <Typography variant="h4">${overview?.totalBalance?.toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'success.light',
              color: 'white',
            }}
          >
            <TrendingUp sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Income</Typography>
            <Typography variant="h4">${overview?.totalIncome?.toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'error.light',
              color: 'white',
            }}
          >
            <TrendingDown sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Expenses</Typography>
            <Typography variant="h4">${overview?.totalExpenses?.toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'info.light',
              color: 'white',
            }}
          >
            <Savings sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Savings</Typography>
            <Typography variant="h4">${overview?.savings?.toFixed(2)}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Spending Trends
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveLine
                data={stats?.spendingTrends || []}
                margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Date',
                  legendOffset: 36,
                  legendPosition: 'middle',
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Amount',
                  legendOffset: -40,
                  legendPosition: 'middle',
                }}
                pointSize={10}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                pointLabelYOffset={-12}
                useMesh={true}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Expense Categories
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsivePie
                data={stats?.expenseCategories || []}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={1}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 1.4]] }}
                legends={[
                  {
                    anchor: 'bottom',
                    direction: 'row',
                    translateY: 56,
                    itemWidth: 100,
                    itemHeight: 18,
                    itemTextColor: '#999',
                    symbolSize: 18,
                    symbolShape: 'circle',
                    effects: [
                      {
                        on: 'hover',
                        style: {
                          itemTextColor: '#000',
                        },
                      },
                    ],
                  },
                ]}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Transactions */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Transactions
        </Typography>
        <Grid container spacing={2}>
          {recentTransactions?.map((transaction) => (
            <Grid item xs={12} key={transaction._id}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  bgcolor: transaction.type === 'income' ? 'success.light' : 'error.light',
                  color: 'white',
                }}
              >
                <Box>
                  <Typography variant="subtitle1">{transaction.description}</Typography>
                  <Typography variant="body2">{transaction.category}</Typography>
                </Box>
                <Typography variant="h6">
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default Dashboard; 