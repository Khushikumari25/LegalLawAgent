const Case = require('../models/Case.model');
const IpcBnsMapping = require('../models/IpcBnsMapping.model');
const AIResult = require('../models/AIResult.model');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');
const crewAIService = require('../services/crewai.service');

// Local IPC to BNS mapping database for instant responses
const LOCAL_IPC_BNS_DATA = {
  '302': { ipcSection: '302', ipcDescription: 'Murder - Whoever commits murder shall be punished with death or imprisonment for life and shall also be liable to fine.', ipcPunishment: 'Death or imprisonment for life, and fine', bnsSection: '101', bnsDescription: 'Murder - Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.', bnsPunishment: 'Death or imprisonment for life, and fine', mappingType: 'Direct', changes: 'Section number changed from 302 to 101. Substance remains the same.' },
  '304': { ipcSection: '304', ipcDescription: 'Culpable homicide not amounting to murder', ipcPunishment: 'Imprisonment for life, or up to 10 years and fine', bnsSection: '105', bnsDescription: 'Culpable homicide not amounting to murder', bnsPunishment: 'Imprisonment for life, or up to 10 years and fine', mappingType: 'Direct', changes: 'Renumbered. No substantive change.' },
  '307': { ipcSection: '307', ipcDescription: 'Attempt to murder', ipcPunishment: 'Up to 10 years imprisonment and fine; if hurt is caused, up to life imprisonment', bnsSection: '109', bnsDescription: 'Attempt to murder', bnsPunishment: 'Up to 10 years imprisonment and fine; if hurt is caused, up to life imprisonment', mappingType: 'Direct', changes: 'Renumbered from 307 to 109. No substantive change.' },
  '376': { ipcSection: '376', ipcDescription: 'Rape - Punishment for sexual assault', ipcPunishment: 'Not less than 10 years, may extend to life imprisonment and fine', bnsSection: '63', bnsDescription: 'Rape - Punishment for sexual assault', bnsPunishment: 'Not less than 10 years, may extend to life imprisonment and fine', mappingType: 'Modified', changes: 'Renumbered to Section 63. Enhanced provisions for repeat offenders and gang rape.' },
  '420': { ipcSection: '420', ipcDescription: 'Cheating and dishonestly inducing delivery of property', ipcPunishment: 'Imprisonment up to 7 years and fine', bnsSection: '316', bnsDescription: 'Cheating and dishonestly inducing delivery of property', bnsPunishment: 'Imprisonment up to 7 years and fine', mappingType: 'Direct', changes: 'Renumbered from 420 to 316. Substance remains largely the same.' },
  '498A': { ipcSection: '498A', ipcDescription: 'Husband or relative of husband subjecting woman to cruelty', ipcPunishment: 'Imprisonment up to 3 years and fine', bnsSection: '84', bnsDescription: 'Cruelty by husband or relatives of husband', bnsPunishment: 'Imprisonment up to 3 years and fine', mappingType: 'Direct', changes: 'Renumbered to Section 84. No major substantive changes.' },
  '304B': { ipcSection: '304B', ipcDescription: 'Dowry death', ipcPunishment: 'Not less than 7 years, may extend to life imprisonment', bnsSection: '80', bnsDescription: 'Dowry death', bnsPunishment: 'Not less than 7 years, may extend to life imprisonment', mappingType: 'Direct', changes: 'Renumbered to Section 80. No substantive change.' },
  '354': { ipcSection: '354', ipcDescription: 'Assault or criminal force to woman with intent to outrage her modesty', ipcPunishment: '1 to 5 years imprisonment and fine', bnsSection: '74', bnsDescription: 'Assault or use of criminal force to woman with intent to outrage her modesty', bnsPunishment: '1 to 5 years imprisonment and fine', mappingType: 'Direct', changes: 'Renumbered to Section 74. No substantive change.' },
  '379': { ipcSection: '379', ipcDescription: 'Theft - Punishment for theft', ipcPunishment: 'Imprisonment up to 3 years, or fine, or both', bnsSection: '303', bnsDescription: 'Theft - Punishment for theft', bnsPunishment: 'Imprisonment up to 3 years, or fine, or both', mappingType: 'Direct', changes: 'Renumbered from 379 to 303. No substantive change.' },
  '406': { ipcSection: '406', ipcDescription: 'Criminal breach of trust', ipcPunishment: 'Imprisonment up to 3 years, or fine, or both', bnsSection: '316', bnsDescription: 'Criminal breach of trust', bnsPunishment: 'Imprisonment up to 3 years, or fine, or both', mappingType: 'Direct', changes: 'Renumbered. Substance remains the same.' },
  '323': { ipcSection: '323', ipcDescription: 'Voluntarily causing hurt', ipcPunishment: 'Imprisonment up to 1 year, or fine up to Rs 1000, or both', bnsSection: '115', bnsDescription: 'Voluntarily causing hurt', bnsPunishment: 'Imprisonment up to 1 year, or fine up to Rs 1000, or both', mappingType: 'Direct', changes: 'Renumbered from 323 to 115.' },
  '506': { ipcSection: '506', ipcDescription: 'Criminal intimidation', ipcPunishment: 'Imprisonment up to 2 years, or fine, or both', bnsSection: '351', bnsDescription: 'Criminal intimidation', bnsPunishment: 'Imprisonment up to 2 years, or fine, or both', mappingType: 'Direct', changes: 'Renumbered from 506 to 351.' },
  '120B': { ipcSection: '120B', ipcDescription: 'Criminal conspiracy', ipcPunishment: 'Same as abetment of the offence', bnsSection: '61', bnsDescription: 'Criminal conspiracy', bnsPunishment: 'Same as abetment of the offence', mappingType: 'Direct', changes: 'Renumbered from 120B to 61.' },
  '34': { ipcSection: '34', ipcDescription: 'Acts done by several persons in furtherance of common intention', ipcPunishment: 'Liability as if done by each person individually', bnsSection: '3(5)', bnsDescription: 'Acts done by several persons in furtherance of common intention', bnsPunishment: 'Liability as if done by each person individually', mappingType: 'Modified', changes: 'Moved to Section 3(5) as a general clause.' },
  '149': { ipcSection: '149', ipcDescription: 'Every member of unlawful assembly guilty of offence committed in prosecution of common object', ipcPunishment: 'Same as the offence committed', bnsSection: '190', bnsDescription: 'Every member of unlawful assembly guilty of offence committed in prosecution of common object', bnsPunishment: 'Same as the offence committed', mappingType: 'Direct', changes: 'Renumbered from 149 to 190.' },
  '147': { ipcSection: '147', ipcDescription: 'Rioting', ipcPunishment: 'Imprisonment up to 2 years, or fine, or both', bnsSection: '188', bnsDescription: 'Rioting', bnsPunishment: 'Imprisonment up to 2 years, or fine, or both', mappingType: 'Direct', changes: 'Renumbered from 147 to 188.' },
  '395': { ipcSection: '395', ipcDescription: 'Dacoity', ipcPunishment: 'Imprisonment for life, or rigorous imprisonment up to 10 years and fine', bnsSection: '310', bnsDescription: 'Dacoity', bnsPunishment: 'Imprisonment for life, or rigorous imprisonment up to 10 years and fine', mappingType: 'Direct', changes: 'Renumbered from 395 to 310.' },
  '304A': { ipcSection: '304A', ipcDescription: 'Death by negligence', ipcPunishment: 'Imprisonment up to 2 years, or fine, or both', bnsSection: '106', bnsDescription: 'Death by negligence', bnsPunishment: 'Imprisonment up to 5 years and fine (enhanced)', mappingType: 'Modified', changes: 'Renumbered to 106. Punishment enhanced to 5 years. Special provision for medical professionals added.' },
  '509': { ipcSection: '509', ipcDescription: 'Word, gesture or act intended to insult the modesty of a woman', ipcPunishment: 'Imprisonment up to 3 years and fine', bnsSection: '79', bnsDescription: 'Word, gesture or act intended to insult the modesty of a woman', bnsPunishment: 'Imprisonment up to 3 years and fine', mappingType: 'Direct', changes: 'Renumbered from 509 to 79.' },
  '375': { ipcSection: '375', ipcDescription: 'Definition of Rape', ipcPunishment: 'Defines the offence (punishment under 376)', bnsSection: '63', bnsDescription: 'Definition of Rape under BNS', bnsPunishment: 'Defines the offence (punishment under 63-70)', mappingType: 'Modified', changes: 'Merged definition and punishment. Expanded scope.' },
};

function getLocalIPCBNSMapping(section) {
  const key = section.toString().toUpperCase().trim();
  return LOCAL_IPC_BNS_DATA[key] || null;
}

// @desc    Analyze case using AI agents
// @route   POST /api/v1/analysis/case/:id
// @access  Private
exports.analyzeCase = async (req, res, next) => {
  try {
    const caseDoc = await Case.findById(req.params.id);

    if (!caseDoc) {
      return ApiResponse.notFound(res, 'Case not found');
    }

    const startTime = Date.now();

    // Use the orchestrator which tries CrewAI then falls back to local agents
    const orchestrator = require('../agents/orchestrator');
    const analysis = await orchestrator.analyzeCaseWithFallback(caseDoc);

    const processingTime = Date.now() - startTime;

    // Ensure confidence is computed
    const ConfidenceCalculator = require('../utils/confidenceScore');
    if (!analysis.confidence || typeof analysis.confidence !== 'object') {
      analysis.confidence = ConfidenceCalculator.calculateCaseConfidence(caseDoc, analysis);
    }

    // Save AI result for tracking
    await AIResult.create({
      caseId: caseDoc._id,
      agentType: 'Case Classification',
      input: {
        caseTitle: caseDoc.caseTitle,
        firNumber: caseDoc.firNumber,
        ipcSections: caseDoc.ipcSections
      },
      output: analysis,
      confidence: analysis.confidence.overall || 0.7,
      processingTime,
      status: 'Success'
    });

    // Update case with AI analysis - map to schema fields
    caseDoc.aiAnalysis = {
      analyzed: true,
      analyzedAt: new Date(),
      summary: analysis.summary || 'Case analyzed successfully',
      keyFindings: analysis.keyFindings || [],
      riskLevel: analysis.riskLevel || 'Medium',
      similarCases: (analysis.similarCases || []).map(c => ({
        caseId: c.caseId || '',
        similarity: c.similarity || 0,
        title: c.title || c.relevance || ''
      })),
      legalInsights: analysis.legalInsights || [],
      retrialProbability: analysis.retrialProbability || 0
    };
    caseDoc.caseStatus = 'Analyzed';
    
    // Update BNS mappings if provided
    if (analysis.ipcBnsMappings && analysis.ipcBnsMappings.length > 0) {
      caseDoc.bnsMappings = analysis.ipcBnsMappings.map(m => ({
        ipcSection: m.ipcSection || '',
        bnsSection: m.bnsSection || '',
        description: '',
        punishmentComparison: ''
      }));
    } else if (analysis.bnsMappings && analysis.bnsMappings.length > 0) {
      caseDoc.bnsMappings = analysis.bnsMappings;
    }

    // Store petition eligibility
    if (analysis.petitionEligibility) {
      caseDoc.petitionEligibility = {
        eligible: analysis.petitionEligibility.eligible || false,
        score: analysis.petitionEligibility.score || 0,
        reasoning: analysis.petitionEligibility.reasoning || '',
        recommendations: analysis.petitionEligibility.recommendations || [],
        evaluatedAt: new Date()
      };
    }

    await caseDoc.save();

    // Return the full analysis (including extended data not in schema) to frontend
    const fullResponse = {
      ...analysis,
      confidence: analysis.confidence || { overall: 0.7, classification: 0.7, mapping: 0.7 }
    };

    logger.info(`Case analyzed: ${caseDoc.firNumber} (${processingTime}ms)`);

    return ApiResponse.success(res, { analysis: fullResponse }, 'Case analyzed successfully');
  } catch (error) {
    logger.error(`Analyze case error: ${error.message}`);
    
    // Save failed AI result
    try {
      await AIResult.create({
        caseId: req.params.id,
        agentType: 'Case Classification',
        input: { caseId: req.params.id },
        output: { error: error.message },
        status: 'Failed',
        errorMessages: [error.message],
        processingTime: 0
      });
    } catch (saveError) {
      logger.error(`Failed to save AI error result: ${saveError.message}`);
    }

    next(error);
  }
};

// @desc    Get analysis results
// @route   GET /api/v1/analysis/case/:id/results
// @access  Private
exports.getAnalysisResults = async (req, res, next) => {
  try {
    const caseDoc = await Case.findById(req.params.id);

    if (!caseDoc) {
      return ApiResponse.notFound(res, 'Case not found');
    }

    const ConfidenceCalculator = require('../utils/confidenceScore');
    const ai = caseDoc.aiAnalysis || {};

    // Always compute confidence on-the-fly so it's never 0
    const confidence = ConfidenceCalculator.calculateCaseConfidence(caseDoc, ai);

    // Build enriched analysis response
    const enrichedAnalysis = {
      analyzed: ai.analyzed || false,
      analyzedAt: ai.analyzedAt || null,
      summary: ai.summary || 'Case has not been analyzed yet.',
      keyFindings: ai.keyFindings || [],
      riskLevel: ai.riskLevel || 'Not assessed',
      legalInsights: ai.legalInsights || [],
      retrialProbability: ai.retrialProbability || 0,
      similarCases: ai.similarCases || [],
      confidence,
      // Add case context for richer display
      caseInfo: {
        title: caseDoc.caseTitle,
        firNumber: caseDoc.firNumber,
        court: caseDoc.court,
        state: caseDoc.state,
        caseType: caseDoc.caseType,
        status: caseDoc.caseStatus,
        ipcSections: (caseDoc.ipcSections || []).map(s => s.section),
        bnsMappings: (caseDoc.bnsMappings || []).map(m => `IPC ${m.ipcSection} → BNS ${m.bnsSection}`)
      },
      petitionEligibility: caseDoc.petitionEligibility || { eligible: false, score: 0, reasoning: 'Not evaluated' }
    };

    // If summary is generic, generate a better one
    if (enrichedAnalysis.summary === 'AI-generated case analysis completed' || !enrichedAnalysis.summary) {
      enrichedAnalysis.summary = `Analysis of "${caseDoc.caseTitle}" (FIR: ${caseDoc.firNumber}). This ${caseDoc.caseType || 'legal'} case is filed in ${caseDoc.court || 'court'}, ${caseDoc.state || ''}. Risk level: ${ai.riskLevel || 'Medium'}. ${(caseDoc.ipcSections || []).length > 0 ? 'IPC Sections: ' + caseDoc.ipcSections.map(s => s.section).join(', ') + '.' : 'No IPC sections identified.'}`;
    }

    // If no key findings, generate from available data
    if (enrichedAnalysis.keyFindings.length === 0) {
      const findings = [];
      findings.push(`Case Type: ${caseDoc.caseType || 'Not specified'}`);
      findings.push(`Court: ${caseDoc.court || 'Not specified'}, ${caseDoc.state || ''}`);
      findings.push(`Status: ${caseDoc.caseStatus || 'Pending'}`);
      if ((caseDoc.ipcSections || []).length > 0) {
        findings.push(`IPC Sections involved: ${caseDoc.ipcSections.map(s => s.section).join(', ')}`);
      }
      if ((caseDoc.bnsMappings || []).length > 0) {
        findings.push(`BNS equivalents mapped: ${caseDoc.bnsMappings.length} section(s)`);
      }
      if (caseDoc.uploadedDocuments && caseDoc.uploadedDocuments.length > 0) {
        findings.push(`Documents uploaded: ${caseDoc.uploadedDocuments.length} file(s)`);
      }
      enrichedAnalysis.keyFindings = findings;
    }

    // If no legal insights, generate from context
    if (enrichedAnalysis.legalInsights.length === 0) {
      const insights = [];
      insights.push(`This case falls under the jurisdiction of ${caseDoc.court || 'the appropriate court'}`);
      if (ai.riskLevel === 'High') {
        insights.push('High risk case — immediate legal counsel recommended');
        insights.push('Consider bail application strategy');
      } else if (ai.riskLevel === 'Medium') {
        insights.push('Moderate risk — prepare comprehensive defense documentation');
      }
      insights.push('Review BNS equivalents for updated provisions under new criminal law');
      enrichedAnalysis.legalInsights = insights;
    }

    return ApiResponse.success(res, { analysis: enrichedAnalysis }, 'Analysis results retrieved');
  } catch (error) {
    logger.error(`Get analysis results error: ${error.message}`);
    next(error);
  }
};

// @desc    Get IPC to BNS mapping
// @route   GET /api/v1/analysis/ipc-bns/:ipcSection
// @access  Private
exports.getIPCToBNSMapping = async (req, res, next) => {
  try {
    const { ipcSection } = req.params;

    // First check database
    let mapping = await IpcBnsMapping.findOne({ ipcSection });

    // If found in database, return immediately
    if (mapping) {
      return ApiResponse.success(res, { mapping }, 'Mapping retrieved successfully');
    }

    // Try local fallback data first (instant response)
    const localMapping = getLocalIPCBNSMapping(ipcSection);
    if (localMapping) {
      // Save to database for future use
      try {
        mapping = await IpcBnsMapping.create(localMapping);
      } catch (saveErr) {
        // If save fails (e.g. duplicate), just return the local data
        mapping = localMapping;
      }
      return ApiResponse.success(res, { mapping }, 'Mapping retrieved successfully');
    }

    // If not in local data, try CrewAI (may timeout)
    try {
      logger.info(`IPC section ${ipcSection} not in local data, querying CrewAI...`);
      const aiMapping = await crewAIService.getIPCToBNSMapping(ipcSection);
      
      // Save to database for future use
      mapping = await IpcBnsMapping.create({
        ipcSection: aiMapping.ipcSection,
        ipcDescription: aiMapping.ipcDescription,
        ipcPunishment: aiMapping.ipcPunishment,
        bnsSection: aiMapping.bnsSection,
        bnsDescription: aiMapping.bnsDescription,
        bnsPunishment: aiMapping.bnsPunishment,
        mappingType: aiMapping.mappingType,
        changes: aiMapping.changes,
        impactAnalysis: aiMapping.impactAnalysis
      });

      return ApiResponse.success(res, { mapping }, 'Mapping retrieved successfully');
    } catch (aiError) {
      logger.warn(`CrewAI timeout/error for IPC ${ipcSection}: ${aiError.message}`);
      // Return a basic mapping response so the UI doesn't break
      return ApiResponse.success(res, { 
        mapping: {
          ipcSection: ipcSection,
          ipcDescription: `IPC Section ${ipcSection}`,
          ipcPunishment: 'Refer to Indian Penal Code for details',
          bnsSection: 'Pending AI mapping',
          bnsDescription: 'AI service is currently unavailable. The mapping will be available once the service responds.',
          bnsPunishment: 'Refer to Bharatiya Nyaya Sanhita for details',
          mappingType: 'Pending',
          changes: 'AI mapping service timed out. Please try again later.'
        }
      }, 'Mapping partially retrieved (AI service unavailable)');
    }
  } catch (error) {
    logger.error(`Get IPC to BNS mapping error: ${error.message}`);
    next(error);
  }
};

// @desc    Search IPC/BNS mappings
// @route   GET /api/v1/analysis/ipc-bns/search
// @access  Private
exports.searchIPCBNSMappings = async (req, res, next) => {
  try {
    const { q } = req.query;

    const mappings = await IpcBnsMapping.find({
      $text: { $search: q }
    }).limit(20);

    return ApiResponse.success(res, { mappings }, 'Search completed');
  } catch (error) {
    logger.error(`Search IPC/BNS mappings error: ${error.message}`);
    next(error);
  }
};

// @desc    Bulk IPC to BNS mapping
// @route   POST /api/v1/analysis/ipc-bns/bulk
// @access  Private
exports.bulkIPCToBNSMapping = async (req, res, next) => {
  try {
    const { ipcSections } = req.body;

    const mappings = await IpcBnsMapping.find({
      ipcSection: { $in: ipcSections }
    });

    return ApiResponse.success(res, { mappings }, 'Bulk mappings retrieved');
  } catch (error) {
    logger.error(`Bulk IPC to BNS mapping error: ${error.message}`);
    next(error);
  }
};

// @desc    Check petition eligibility
// @route   POST /api/v1/analysis/petition-eligibility
// @access  Private
exports.checkPetitionEligibility = async (req, res, next) => {
  try {
    const { caseId } = req.body;

    const caseDoc = await Case.findById(caseId);

    if (!caseDoc) {
      return ApiResponse.notFound(res, 'Case not found');
    }

    const startTime = Date.now();
    let eligibility;

    // Try CrewAI first, fall back to local evaluation
    try {
      eligibility = await crewAIService.evaluatePetitionEligibility(caseDoc);
    } catch (aiError) {
      logger.warn(`CrewAI unavailable for eligibility, using fallback: ${aiError.message}`);
      const aiFallback = require('../services/ai-fallback.service');
      eligibility = aiFallback.evaluatePetitionEligibility(caseDoc);
    }

    const processingTime = Date.now() - startTime;

    // Save AI result
    await AIResult.create({
      caseId: caseDoc._id,
      agentType: 'Petition Eligibility',
      input: {
        caseTitle: caseDoc.caseTitle,
        firNumber: caseDoc.firNumber
      },
      output: eligibility,
      confidence: eligibility.confidence,
      processingTime,
      status: 'Success'
    });

    caseDoc.petitionEligibility = eligibility;
    await caseDoc.save();

    logger.info(`Petition eligibility evaluated for case: ${caseDoc.firNumber} (${processingTime}ms)`);

    return ApiResponse.success(res, { eligibility }, 'Eligibility evaluated successfully');
  } catch (error) {
    logger.error(`Check petition eligibility error: ${error.message}`);
    next(error);
  }
};

// @desc    Get petition eligibility
// @route   GET /api/v1/analysis/petition-eligibility/:caseId
// @access  Private
exports.getPetitionEligibility = async (req, res, next) => {
  try {
    const caseDoc = await Case.findById(req.params.caseId);

    if (!caseDoc) {
      return ApiResponse.notFound(res, 'Case not found');
    }

    return ApiResponse.success(res, { eligibility: caseDoc.petitionEligibility }, 'Eligibility retrieved');
  } catch (error) {
    logger.error(`Get petition eligibility error: ${error.message}`);
    next(error);
  }
};

// @desc    Find similar cases
// @route   GET /api/v1/analysis/similar-cases/:id
// @access  Private
exports.findSimilarCases = async (req, res, next) => {
  try {
    const caseDoc = await Case.findById(req.params.id);

    if (!caseDoc) {
      return ApiResponse.notFound(res, 'Case not found');
    }

    // Use CrewAI to find similar cases
    const similarCases = await crewAIService.findSimilarCases(caseDoc);

    logger.info(`Found ${similarCases.length} similar cases for: ${caseDoc.firNumber}`);

    return ApiResponse.success(res, { similarCases }, 'Similar cases retrieved');
  } catch (error) {
    logger.error(`Find similar cases error: ${error.message}`);
    next(error);
  }
};

// @desc    Get legal insights
// @route   GET /api/v1/analysis/insights/:id
// @access  Private
exports.getLegalInsights = async (req, res, next) => {
  try {
    const caseDoc = await Case.findById(req.params.id);

    if (!caseDoc) {
      return ApiResponse.notFound(res, 'Case not found');
    }

    const insights = caseDoc.aiAnalysis?.legalInsights || [];

    return ApiResponse.success(res, { insights }, 'Legal insights retrieved');
  } catch (error) {
    logger.error(`Get legal insights error: ${error.message}`);
    next(error);
  }
};
