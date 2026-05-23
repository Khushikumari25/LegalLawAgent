const mongoose = require('mongoose');

const aiResultSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true
  },
  agentType: {
    type: String,
    required: true,
    enum: [
      'Case Classification',
      'IPC vs BNS',
      'Petition Eligibility',
      'Suggestion',
      'Analytics'
    ]
  },
  input: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  output: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  processingTime: {
    type: Number, // in milliseconds
    required: true
  },
  model: {
    name: String,
    version: String,
    provider: String
  },
  metadata: {
    tokensUsed: Number,
    cost: Number,
    iterations: Number
  },
  status: {
    type: String,
    enum: ['Success', 'Partial', 'Failed'],
    default: 'Success'
  },
  errorMessages: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
aiResultSchema.index({ caseId: 1 });
aiResultSchema.index({ agentType: 1 });
aiResultSchema.index({ createdAt: -1 });
aiResultSchema.index({ status: 1 });

module.exports = mongoose.model('AIResult', aiResultSchema);
