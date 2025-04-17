import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';

function Analytics() {
  const [timeRange, setTimeRange] = useState('month');

  // Sample data for charts
  const spendingTrendData = [
    {
      id: 'Spending',
      data: [
        { x: 'Jan', y: 1200 },
        { x: 'Feb', y: 1500 },
        { x: 'Mar', y: 1300 },
        { x: 'Apr', y: 1800 },
        { x: 'May', y: 1600 },
        { x: 'Jun', y: 2000 },
      ],
    },
  ];

  const categoryDistributionData = [
    {
      id: 'Food',
      label: 'Food',
      value: 35,
    },
    {
      id: 'Transportation',
      label: 'Transportation',
      value: 25,
    },
    {
      id: 'Entertainment',
      label: 'Entertainment',
      value: 20,
    },
    {
      id: 'Shopping',
      label: 'Shopping',
      value: 15,
    },
    {
      id: 'Bills',
      label: 'Bills',
      value: 5,
    },
  ];

  const monthlyComparisonData = [
    {
      category: 'Food',
      'Last Month': 1200,
      'This Month': 1500,
    },
    {
      category: 'Transportation',
      'Last Month': 800,
      'This Month': 1000,
    },
    {
      category: 'Entertainment',
      'Last Month': 600,
      'This Month': 800,
    },
    {
      category: 'Shopping',
      'Last Month': 400,
      'This Month': 500,
    },
    {
      category: 'Bills',
      'Last Month': 200,
      'This Month': 200,
    },
  ];

  const InsightCard = ({ title, value, change, description }) => (
    <Card>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div">
          ${value}
        </Typography>
        <Typography
          variant="body2"
          color={change >= 0 ? 'success.main' : 'error.main'}
          sx={{ mt: 1 }}
        >
          {change >= 0 ? '+' : ''}{change}% from last {timeRange}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Analytics</Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <InsightCard
            title="Total Spending"
            value="5,200"
            change={15.4}
            description="Your total spending has increased by 15.4% compared to last month"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <InsightCard
            title="Average Daily"
            value="173"
            change={-5.2}
            description="Your average daily spending has decreased by 5.2%"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <InsightCard
            title="Savings Rate"
            value="25%"
            change={3.1}
            description="Your savings rate has improved by 3.1%"
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Spending Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveLine
                data={spendingTrendData}
                margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
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
              Category Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsivePie
                data={categoryDistributionData}
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
                  },
                ]}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Category Comparison
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveBar
                data={monthlyComparisonData}
                keys={['Last Month', 'This Month']}
                indexBy="category"
                margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                padding={0.3}
                valueScale={{ type: 'linear' }}
                colors={{ scheme: 'nivo' }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                animate={true}
                motionStiffness={90}
                motionDamping={15}
                legends={[
                  {
                    dataFrom: 'keys',
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 120,
                    translateY: 0,
                    itemsSpacing: 2,
                    itemWidth: 100,
                    itemHeight: 20,
                    itemDirection: 'left-to-right',
                    itemOpacity: 0.85,
                    symbolSize: 20,
                  },
                ]}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Analytics; 