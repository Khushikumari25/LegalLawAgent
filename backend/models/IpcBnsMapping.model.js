const mongoose = require('mongoose');

const ipcBnsMappingSchema = new mongoose.Schema({
  ipcSection: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  ipcDescription: {
    type: String,
    required: true
  },
  ipcPunishment: {
    type: String,
    required: true
  },
  bnsSection: {
    type: String,
    required: true,
    trim: true
  },
  bnsDescription: {
    type: String,
    required: true
  },
  bnsPunishment: {
    type: String,
    required: true
  },
  mappingType: {
    type: String,
    enum: ['Direct', 'Modified', 'Removed', 'New'],
    default: 'Direct'
  },
  changes: {
    type: String,
    default: ''
  },
  impactAnalysis: {
    severity: {
      type: String,
      enum: ['Minor', 'Moderate', 'Major', 'Critical']
    },
    description: String
  },
  category: {
    type: String,
    enum: [
      'Offences Against State',
      'Offences Against Public Tranquility',
      'Offences Against Human Body',
      'Offences Against Property',
      'Offences Against Women',
      'Offences Against Children',
      'Other Offences'
    ]
  },
  keywords: [String],
  relatedSections: {
    ipc: [String],
    bns: [String]
  },
  caseReferences: [{
    caseTitle: String,
    court: String,
    year: Number,
    citation: String
  }],
  effectiveDate: {
    type: Date,
    default: new Date('2024-07-01')
  },
  isActive: {
    type: Boolean,
    default: true
  },
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

// Indexes
ipcBnsMappingSchema.index({ bnsSection: 1 });
ipcBnsMappingSchema.index({ category: 1 });
ipcBnsMappingSchema.index({ mappingType: 1 });

// Text search index
ipcBnsMappingSchema.index({
  ipcDescription: 'text',
  bnsDescription: 'text',
  keywords: 'text'
});

module.exports = mongoose.model('IpcBnsMapping', ipcBnsMappingSchema);
