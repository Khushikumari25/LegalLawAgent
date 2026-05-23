const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Dashboard analytics
router.get('/dashboard', analyticsController.getDashboardStats);

// Trends and insights
router.get('/trends', analyticsController.getTrends);
router.get('/trends/monthly', analyticsController.getMonthlyTrends);
router.get('/trends/yearly', analyticsController.getYearlyTrends);

// State-wise analytics
router.get('/state-wise', analyticsController.getStateWiseAnalytics);
router.get('/state/:state', analyticsController.getStateAnalytics);

// Court-wise analytics
router.get('/court-wise', analyticsController.getCourtWiseAnalytics);

// IPC/BNS analytics
router.get('/ipc-frequency', analyticsController.getIPCFrequency);
router.get('/bns-frequency', analyticsController.getBNSFrequency);
router.get('/ipc-bns-comparison', analyticsController.getIPCBNSComparison);

// Case type analytics
router.get('/case-types', analyticsController.getCaseTypeAnalytics);

// Risk distribution
router.get('/risk-distribution', analyticsController.getRiskDistribution);

// User activity (admin only)
router.get('/user-activity', authorize('admin'), analyticsController.getUserActivity);

// Generate analytics report
router.post('/generate-report', analyticsController.generateAnalyticsReport);

module.exports = router;
