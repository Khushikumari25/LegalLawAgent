const Case = require('../models/Case.model');
const Analytics = require('../models/Analytics.model');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalCases = await Case.countDocuments();
    const analyzedCases = await Case.countDocuments({ 'aiAnalysis.analyzed': true });
    const pendingCases = await Case.countDocuments({ caseStatus: 'Pending' });
    const eligiblePetitions = await Case.countDocuments({ 'petitionEligibility.eligible': true });

    const casesByType = await Case.aggregate([
      { $group: { _id: '$caseType', count: { $sum: 1 } } }
    ]);

    const casesByCourt = await Case.aggregate([
      { $group: { _id: '$court', count: { $sum: 1 } } }
    ]);

    const stats = {
      totalCases,
      analyzedCases,
      pendingCases,
      eligiblePetitions,
      casesByType,
      casesByCourt
    };

    return ApiResponse.success(res, { stats }, 'Dashboard stats retrieved');
  } catch (error) {
    logger.error(`Get dashboard stats error: ${error.message}`);
    next(error);
  }
};

exports.getTrends = async (req, res, next) => {
  try {
    const trends = await Analytics.find({ type: 'Monthly' })
      .sort({ 'period.start': -1 })
      .limit(12);

    return ApiResponse.success(res, { trends }, 'Trends retrieved');
  } catch (error) {
    logger.error(`Get trends error: ${error.message}`);
    next(error);
  }
};

exports.getMonthlyTrends = async (req, res, next) => {
  try {
    const trends = await Analytics.find({ type: 'Monthly' })
      .sort({ 'period.start': -1 })
      .limit(12);

    return ApiResponse.success(res, { trends }, 'Monthly trends retrieved');
  } catch (error) {
    next(error);
  }
};

exports.getYearlyTrends = async (req, res, next) => {
  try {
    const trends = await Analytics.find({ type: 'Yearly' })
      .sort({ 'period.start': -1 })
      .limit(5);

    return ApiResponse.success(res, { trends }, 'Yearly trends retrieved');
  } catch (error) {
    next(error);
  }
};

exports.getStateWiseAnalytics = async (req, res, next) => {
  try {
    const stateWise = await Case.aggregate([
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return ApiResponse.success(res, { stateWise }, 'State-wise analytics retrieved');
  } catch (error) {
    next(error);
  }
};

exports.getStateAnalytics = async (req, res, next) => {
  try {
    const { state } = req.params;
    const cases = await Case.find({ state });

    return ApiResponse.success(res, { cases }, 'State analytics retrieved');
  } catch (error) {
    next(error);
  }
};

exports.getCourtWiseAnalytics = async (req, res, next) => {
  try {
    const courtWise = await Case.aggregate([
      { $group: { _id: '$court', count: { $sum: 1 } } }
    ]);

    return ApiResponse.success(res, { courtWise }, 'Court-wise analytics retrieved');
  } catch (error) {
    next(error);
  }
};

exports.getIPCFrequency = async (req, res, next) => {
  try {
    const ipcFrequency = await Case.aggregate([
      { $unwind: '$ipcSections' },
      { $group: { _id: '$ipcSections.section', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    return ApiResponse.success(res, { ipcFrequency }, 'IPC frequency retrieved');
  } catch (error) {
    next(error);
  }
};

exports.getBNSFrequency = async (req, res, next) => {
  try {
    const bnsFrequency = await Case.aggregate([
      { $unwind: '$bnsMappings' },
      { $group: { _id: '$bnsMappings.bnsSection', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    return ApiResponse.success(res, { bnsFrequency }, 'BNS frequency retrieved');
  } catch (error) {
    next(error);
  }
};

exports.getIPCBNSComparison = async (req, res, next) => {
  try {
    const comparison = {
      totalIPCSections: await Case.aggregate([
        { $unwind: '$ipcSections' },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]),
      totalBNSMappings: await Case.aggregate([
        { $unwind: '$bnsMappings' },
        { $group: { _id: null, count: { $sum: 1 } } }
      ])
    };

    return ApiResponse.success(res, { comparison }, 'IPC-BNS comparison retrieved');
  } catch (error) {
    next(error);
  }
};

exports.getCaseTypeAnalytics = async (req, res, next) => {
  try {
    const caseTypes = await Case.aggregate([
      { $group: { _id: '$caseType', count: { $sum: 1 } } }
    ]);

    return ApiResponse.success(res, { caseTypes }, 'Case type analytics retrieved');
  } catch (error) {
    next(error);
  }
};

exports.getRiskDistribution = async (req, res, next) => {
  try {
    const riskDistribution = await Case.aggregate([
      { $match: { 'aiAnalysis.riskLevel': { $exists: true } } },
      { $group: { _id: '$aiAnalysis.riskLevel', count: { $sum: 1 } } }
    ]);

    return ApiResponse.success(res, { riskDistribution }, 'Risk distribution retrieved');
  } catch (error) {
    next(error);
  }
};

exports.getUserActivity = async (req, res, next) => {
  try {
    const User = require('../models/User.model');
    
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    return ApiResponse.success(res, { totalUsers, activeUsers }, 'User activity retrieved');
  } catch (error) {
    next(error);
  }
};

exports.generateAnalyticsReport = async (req, res, next) => {
  try {
    // TODO: Implement report generation
    return ApiResponse.success(res, null, 'Analytics report generated');
  } catch (error) {
    next(error);
  }
};
