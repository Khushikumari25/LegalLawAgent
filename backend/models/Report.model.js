const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportTitle: {
    type: String,
    required: true,
    trim: true
  },
  reportType: {
    type: String,
    required: true,
    enum: ['Case Analysis', 'IPC-BNS Comparison', 'Petition Eligibility', 'Analytics Summary', 'Custom']
  },
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case'
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    summary: String,
    sections: [{
      title: String,
      content: String,
      data: mongoose.Schema.Types.Mixed
    }],
    charts: [{
      type: String,
      data: mongoose.Schema.Types.Mixed,
      config: mongoose.Schema.Types.Mixed
    }],
    tables: [{
      title: String,
      headers: [String],
      rows: [[mongoose.Schema.Types.Mixed]]
    }]
  },
  metadata: {
    dateRange: {
      start: Date,
      end: Date
    },
    filters: mongoose.Schema.Types.Mixed,
    parameters: mongoose.Schema.Types.Mixed
  },
  format: {
    type: String,
    enum: ['PDF', 'Excel', 'JSON', 'HTML'],
    default: 'PDF'
  },
  filePath: String,
  fileSize: Number,
  status: {
    type: String,
    enum: ['Generating', 'Completed', 'Failed'],
    default: 'Generating'
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30*24*60*60*1000) // 30 days
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
reportSchema.index({ generatedBy: 1 });
reportSchema.index({ caseId: 1 });
reportSchema.index({ reportType: 1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Report', reportSchema);
