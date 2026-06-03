const Case = require('../models/Case.model');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');
const { extractTextFromPDF, extractIPCSections, extractCaseMetadata } = require('../utils/pdfExtractor');

// @desc    Get all cases
// @route   GET /api/v1/cases
// @access  Private
exports.getAllCases = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = req.user.role === 'admin' ? {} : { uploadedBy: req.user.id };

    const cases = await Case.find(query)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Case.countDocuments(query);

    return ApiResponse.paginated(res, { cases }, { page, limit, total }, 'Cases retrieved successfully');
  } catch (error) {
    logger.error(`Get all cases error: ${error.message}`);
    next(error);
  }
};

// @desc    Create new case
// @route   POST /api/v1/cases
// @access  Private
exports.createCase = async (req, res, next) => {
  try {
    const caseData = {
      ...req.body,
      uploadedBy: req.user.id
    };

    // Handle uploaded documents
    if (req.files && req.files.length > 0) {
      caseData.uploadedDocuments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }));

      // Extract text from first PDF
      const pdfFile = req.files.find(f => f.mimetype === 'application/pdf');
      if (pdfFile) {
        try {
          // Quick extraction for large PDFs (first 50 pages only for metadata)
          const extracted = await extractTextFromPDF(pdfFile.path, { 
            maxPages: 50, 
            maxTextLength: 500000 
          });
          
          caseData.extractedText = extracted.text;
          caseData.metadata = caseData.metadata || {};
          caseData.metadata.totalPages = extracted.pages;
          caseData.metadata.textTruncated = extracted.truncated;

          // Extract IPC sections from available text
          const ipcSections = extractIPCSections(extracted.text);
          if (ipcSections.length > 0) {
            caseData.ipcSections = ipcSections.map(ipc => ({
              section: ipc.section,
              description: ipc.context
            }));
          }

          // Extract metadata from available text
          const metadata = extractCaseMetadata(extracted.text);
          
          // Only merge valid metadata fields (skip null/undefined values)
          const cleanMetadata = {};
          if (metadata.firNumber) cleanMetadata.firNumber = metadata.firNumber;
          if (metadata.policeStation) cleanMetadata.policeStation = metadata.policeStation;
          if (metadata.dateOfIncident) cleanMetadata.dateOfIncident = metadata.dateOfIncident;
          if (metadata.accused && metadata.accused.length > 0) cleanMetadata.accused = metadata.accused;
          if (metadata.victims && metadata.victims.length > 0) cleanMetadata.victims = metadata.victims;
          
          caseData.metadata = { ...caseData.metadata, ...cleanMetadata };
          
          logger.info(`Large PDF processed: ${extracted.pages} pages, truncated: ${extracted.truncated}`);
        } catch (extractError) {
          logger.warn(`PDF extraction failed: ${extractError.message}`);
          // Continue without extraction - file is still saved
        }
      }
    }

    const newCase = await Case.create(caseData);
    await newCase.populate('uploadedBy', 'name email');

    logger.info(`New case created: ${newCase.firNumber} by ${req.user.email}`);

    // Auto-trigger AI analysis in background (non-blocking)
    if (newCase.extractedText && newCase.extractedText.length > 50) {
      setImmediate(async () => {
        try {
          const orchestrator = require('../agents/orchestrator');
          const analysis = await orchestrator.analyzeCaseWithFallback(newCase);
          
          // Save analysis to case
          const Case = require('../models/Case.model');
          await Case.findByIdAndUpdate(newCase._id, {
            'aiAnalysis.analyzed': true,
            'aiAnalysis.analyzedAt': new Date(),
            'aiAnalysis.summary': analysis.summary || 'Auto-analyzed on upload',
            'aiAnalysis.keyFindings': analysis.keyFindings || [],
            'aiAnalysis.riskLevel': analysis.riskLevel || 'Medium',
            'aiAnalysis.legalInsights': analysis.legalInsights || [],
            'aiAnalysis.retrialProbability': analysis.retrialProbability || 0,
            caseStatus: 'Analyzed'
          });

          // Save petition eligibility if available
          if (analysis.petitionEligibility) {
            await Case.findByIdAndUpdate(newCase._id, {
              'petitionEligibility.eligible': analysis.petitionEligibility.eligible || false,
              'petitionEligibility.score': analysis.petitionEligibility.score || 0,
              'petitionEligibility.reasoning': analysis.petitionEligibility.reasoning || '',
              'petitionEligibility.evaluatedAt': new Date()
            });
          }

          logger.info(`Auto-analysis complete for case: ${newCase.firNumber}`);
        } catch (analysisError) {
          logger.warn(`Auto-analysis failed for ${newCase.firNumber}: ${analysisError.message}`);
        }
      });
    }

    return ApiResponse.created(res, { case: newCase }, 'Case created successfully');
  } catch (error) {
    logger.error(`Create case error: ${error.message}`);
    next(error);
  }
};

// @desc    Get case by ID
// @route   GET /api/v1/cases/:id
// @access  Private
exports.getCaseById = async (req, res, next) => {
  try {
    const caseDoc = await Case.findById(req.params.id)
      .populate('uploadedBy', 'name email role');

    if (!caseDoc) {
      return ApiResponse.notFound(res, 'Case not found');
    }

    // Check authorization
    if (req.user.role !== 'admin' && caseDoc.uploadedBy._id.toString() !== req.user.id) {
      return ApiResponse.forbidden(res, 'Not authorized to access this case');
    }

    return ApiResponse.success(res, { case: caseDoc }, 'Case retrieved successfully');
  } catch (error) {
    logger.error(`Get case error: ${error.message}`);
    next(error);
  }
};

// @desc    Update case
// @route   PUT /api/v1/cases/:id
// @access  Private
exports.updateCase = async (req, res, next) => {
  try {
    let caseDoc = await Case.findById(req.params.id);

    if (!caseDoc) {
      return ApiResponse.notFound(res, 'Case not found');
    }

    // Check authorization
    if (req.user.role !== 'admin' && caseDoc.uploadedBy.toString() !== req.user.id) {
      return ApiResponse.forbidden(res, 'Not authorized to update this case');
    }

    caseDoc = await Case.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('uploadedBy', 'name email');

    logger.info(`Case updated: ${caseDoc.firNumber}`);

    return ApiResponse.success(res, { case: caseDoc }, 'Case updated successfully');
  } catch (error) {
    logger.error(`Update case error: ${error.message}`);
    next(error);
  }
};

// @desc    Delete case
// @route   DELETE /api/v1/cases/:id
// @access  Private (Admin/Lawyer)
exports.deleteCase = async (req, res, next) => {
  try {
    const caseDoc = await Case.findById(req.params.id);

    if (!caseDoc) {
      return ApiResponse.notFound(res, 'Case not found');
    }

    await caseDoc.deleteOne();

    logger.info(`Case deleted: ${caseDoc.firNumber}`);

    return ApiResponse.success(res, null, 'Case deleted successfully');
  } catch (error) {
    logger.error(`Delete case error: ${error.message}`);
    next(error);
  }
};

// @desc    Add documents to case
// @route   POST /api/v1/cases/:id/documents
// @access  Private
exports.addDocuments = async (req, res, next) => {
  try {
    const caseDoc = await Case.findById(req.params.id);

    if (!caseDoc) {
      return ApiResponse.notFound(res, 'Case not found');
    }

    if (req.files && req.files.length > 0) {
      const newDocuments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }));

      caseDoc.uploadedDocuments.push(...newDocuments);
      await caseDoc.save();
    }

    return ApiResponse.success(res, { case: caseDoc }, 'Documents added successfully');
  } catch (error) {
    logger.error(`Add documents error: ${error.message}`);
    next(error);
  }
};

// @desc    Delete document from case
// @route   DELETE /api/v1/cases/:id/documents/:documentId
// @access  Private
exports.deleteDocument = async (req, res, next) => {
  try {
    const caseDoc = await Case.findById(req.params.id);

    if (!caseDoc) {
      return ApiResponse.notFound(res, 'Case not found');
    }

    caseDoc.uploadedDocuments = caseDoc.uploadedDocuments.filter(
      doc => doc._id.toString() !== req.params.documentId
    );

    await caseDoc.save();

    return ApiResponse.success(res, { case: caseDoc }, 'Document deleted successfully');
  } catch (error) {
    logger.error(`Delete document error: ${error.message}`);
    next(error);
  }
};

// @desc    Search cases
// @route   GET /api/v1/cases/search
// @access  Private
exports.searchCases = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return ApiResponse.badRequest(res, 'Search query is required');
    }

    const cases = await Case.find({
      $text: { $search: q }
    }).populate('uploadedBy', 'name email').limit(20);

    return ApiResponse.success(res, { cases }, 'Search completed successfully');
  } catch (error) {
    logger.error(`Search cases error: ${error.message}`);
    next(error);
  }
};

// @desc    Filter cases
// @route   GET /api/v1/cases/filter
// @access  Private
exports.filterCases = async (req, res, next) => {
  try {
    const { court, state, caseType, caseStatus } = req.query;
    const filter = {};

    if (court) filter.court = court;
    if (state) filter.state = state;
    if (caseType) filter.caseType = caseType;
    if (caseStatus) filter.caseStatus = caseStatus;

    const cases = await Case.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, { cases }, 'Cases filtered successfully');
  } catch (error) {
    logger.error(`Filter cases error: ${error.message}`);
    next(error);
  }
};

// @desc    Get case statistics
// @route   GET /api/v1/cases/stats/overview
// @access  Private
exports.getCaseStats = async (req, res, next) => {
  try {
    const totalCases = await Case.countDocuments();
    const analyzedCases = await Case.countDocuments({ 'aiAnalysis.analyzed': true });
    const pendingCases = await Case.countDocuments({ caseStatus: 'Pending' });
    const eligiblePetitions = await Case.countDocuments({ 'petitionEligibility.eligible': true });

    const stats = {
      totalCases,
      analyzedCases,
      pendingCases,
      eligiblePetitions,
      analysisRate: totalCases > 0 ? ((analyzedCases / totalCases) * 100).toFixed(2) : 0
    };

    return ApiResponse.success(res, { stats }, 'Statistics retrieved successfully');
  } catch (error) {
    logger.error(`Get case stats error: ${error.message}`);
    next(error);
  }
};
