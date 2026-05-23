const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  caseTitle: {
    type: String,
    required: [true, 'Please provide a case title'],
    trim: true
  },
  firNumber: {
    type: String,
    required: [true, 'Please provide FIR number'],
    trim: true,
    unique: true
  },
  policeStation: {
    type: String,
    required: [true, 'Please provide police station'],
    trim: true
  },
  court: {
    type: String,
    required: [true, 'Please provide court name'],
    enum: ['District Court', 'High Court', 'Supreme Court', 'Other']
  },
  state: {
    type: String,
    required: [true, 'Please provide state'],
    trim: true
  },
  caseType: {
    type: String,
    required: [true, 'Please provide case type'],
    enum: ['Criminal', 'Civil', 'Constitutional', 'Other']
  },
  ipcSections: [{
    section: {
      type: String,
      required: true
    },
    description: String
  }],
  bnsMappings: [{
    ipcSection: String,
    bnsSection: String,
    description: String,
    punishmentComparison: String
  }],
  uploadedDocuments: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  extractedText: {
    type: String,
    default: ''
  },
  caseStatus: {
    type: String,
    enum: ['Pending', 'Under Review', 'Analyzed', 'Closed'],
    default: 'Pending'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  aiAnalysis: {
    analyzed: {
      type: Boolean,
      default: false
    },
    analyzedAt: Date,
    summary: String,
    keyFindings: [String],
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical']
    },
    similarCases: [{
      caseId: String,
      similarity: Number,
      title: String
    }],
    legalInsights: [String],
    retrialProbability: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  petitionEligibility: {
    eligible: {
      type: Boolean,
      default: false
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    reasoning: String,
    recommendations: [String],
    evaluatedAt: Date
  },
  metadata: {
    dateOfIncident: Date,
    dateOfFiling: Date,
    accused: [String],
    victims: [String],
    witnesses: [String],
    evidenceCount: Number
  },
  tags: [String],
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
caseSchema.index({ uploadedBy: 1 });
caseSchema.index({ caseStatus: 1 });
caseSchema.index({ court: 1, state: 1 });
caseSchema.index({ createdAt: -1 });
caseSchema.index({ 'ipcSections.section': 1 });

// Text index for search
caseSchema.index({
  caseTitle: 'text',
  extractedText: 'text',
  'aiAnalysis.summary': 'text'
});

module.exports = mongoose.model('Case', caseSchema);
