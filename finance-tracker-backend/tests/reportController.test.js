const { generateReport, getReports, getReportById, getSummaryReport, getSpendingTrends, getDateRangeReport, getFilteredTransactions } = require('../controllers/reportController');

const Report = require('../models/Report');
const Transaction = require('../models/Transaction');

jest.mock('../models/Report');
jest.mock('../models/Transaction');

describe('Report Controller', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
      user: { id: 'testUserId' }
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('generateReport', () => {
    it('should generate a report successfully', async () => {
      const reportData = {
        type: 'daily',
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };
      mockReq.body = reportData;

      // Mock Transaction.find to return some test transactions
      Transaction.find.mockResolvedValue([
        { amount: 100, category: 'Food', date: new Date('2024-01-01') },
        { amount: 200, category: 'Transport', date: new Date('2024-01-02') }
      ]);

      // Mock Report.create to return a test report
      Report.create.mockResolvedValue({
        _id: 'testReportId',
        ...reportData,
        totalSpending: 300,
        categoryBreakdown: [
          { category: 'Food', amount: 100, percentage: 33.33 },
          { category: 'Transport', amount: 200, percentage: 66.67 }
        ],
        trendData: [
          { date: new Date('2024-01-01'), amount: 100 },
          { date: new Date('2024-01-02'), amount: 200 }
        ],
        topCategories: [
          { category: 'Transport', amount: 200, percentage: 66.67 },
          { category: 'Food', amount: 100, percentage: 33.33 }
        ],
        averageSpending: 150
      });

      await generateReport(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Report generated successfully',
        report: expect.any(Object)
      });
    });

    it('should handle invalid report type', async () => {
      mockReq.body = { type: 'invalid' };

      await generateReport(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid report type'
      });
    });

    it('should handle missing date parameters', async () => {
      mockReq.body = { type: 'daily' };

      await generateReport(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Start date and end date are required'
      });
    });
  });

  describe('getSummaryReport', () => {
    it('should return summary report data', async () => {
      const mockSummary = [
        {
          type: 'income',
          categories: [{ category: 'Salary', totalAmount: 5000, count: 1 }],
          total: 5000
        },
        {
          type: 'expense',
          categories: [{ category: 'Food', totalAmount: 1000, count: 2 }],
          total: 1000
        }
      ];
      Transaction.aggregate.mockResolvedValue(mockSummary);

      await getSummaryReport(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockSummary);
    });
  });

  describe('getSpendingTrends', () => {
    it('should return spending trends data', async () => {
      mockReq.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        interval: 'month'
      };
      const mockTrends = [
        {
          period: '2024-01',
          totalIncome: 5000,
          totalExpenses: 3000,
          netBalance: 2000
        }
      ];
      Transaction.aggregate.mockResolvedValue(mockTrends);

      await getSpendingTrends(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockTrends);
    });

    it('should handle missing date parameters', async () => {
      await getSpendingTrends(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Start date and end date are required'
      });
    });
  });

  describe('getDateRangeReport', () => {
    it('should return transactions within date range', async () => {
      mockReq.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };
      const mockTransactions = [
        { amount: 100, type: 'expense' },
        { amount: 200, type: 'income' }
      ];
      Transaction.find.mockResolvedValue(mockTransactions);

      await getDateRangeReport(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockTransactions);
    });

    it('should handle missing date parameters', async () => {
      await getDateRangeReport(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Start date and end date are required'
      });
    });
  });

  describe('getFilteredTransactions', () => {
    it('should return filtered transactions', async () => {
      mockReq.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        category: 'Food',
        tags: 'groceries,restaurant'
      };
      const mockTransactions = [
        { amount: 100, type: 'expense', category: 'Food', tags: ['groceries'] }
      ];
      Transaction.find.mockResolvedValue(mockTransactions);

      await getFilteredTransactions(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockTransactions);
    });

    it('should handle missing date parameters', async () => {
      await getFilteredTransactions(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Start date and end date are required'
      });
    });
  });
}); 