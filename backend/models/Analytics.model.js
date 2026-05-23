const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom']
  },
  period: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },
  metrics: {
    totalCases: {
      type: Number,
      default: 0
    },
    analyzedCases: {
      type: Number,
      default: 0
    },
    pendingCases: {
      type: Number,
      default: 0
    },
    eligiblePetitions: {
      type: Number,
      default: 0
    },
    averageProcessingTime: {
      type: Number,
      default: 0
    }
  },
  casesByType: [{
    type: String,
    count: Number
  }],
  casesByCourt: [{
    court: String,
    count: Number
  }],
  casesByState: [{
    state: String,
    count: Number,
    convictionRate: Number
  }],
  ipcSectionFrequency: [{
    section: String,
    count: Number,
    percentage: Number
  }],
  bnsSectionFrequency: [{
    section: String,
    count: Number,
    percentage: Number
  }],
  riskDistribution: {
    low: Number,
    medium: Number,
    high: Number,
    critical: Number
  },
  trends: {
    caseGrowth: Number,
    analysisGrowth: Number,
    petitionGrowth: Number
  },
  topIpcSections: [{
    section: String,
    count: Number,
    bnsEquivalent: String
  }],
  userActivity: {
    totalUsers: Number,
    activeUsers: Number,
    newUsers: Number
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
analyticsSchema.index({ type: 1, 'period.start': -1 });
analyticsSchema.index({ generatedAt: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
