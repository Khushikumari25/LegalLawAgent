/**
 * Legal Workflow Orchestrator
 * Multi-agent pipeline with shared state, execution tracking, fallback handling,
 * and structured JSON outputs for every agent.
 *
 * Architecture:
 *   Input -> Extraction -> Classification -> IPC/BNS -> Risk -> Petition -> Strategy -> Report
 *
 * Every agent returns a validated structured object (never plain text).
 * If CrewAI fails, local fallback agents produce the same schema.
 */

const logger = require('../utils/logger');
const ConfidenceCalculator = require('../utils/confidenceScore');
const crewAIService = require('../services/crewai.service');
const aiFallback = require('../services/ai-fallback.service');

const STATUS = Object.freeze({
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped'
});

// ============================================================
// OUTPUT SCHEMAS — null-safe defaults for every agent
// ============================================================

const SCHEMAS = {
  extraction: () => ({
    text: '',
    pages: 0,
    ipcSections: [],
    metadata: { firNumber: null, policeStation: null, dateOfIncident: null, accused: [], victims: [] },
    confidence: 0
  }),

  classification: () => ({
    caseType: 'Other',
    category: 'Unclassified',
    severity: 'Medium',
    subCategory: null,
    confidence: 0
  }),

  ipcBns: () => ({
    mappings: [],
    totalMapped: 0,
    unmapped: [],
    confidence: 0
  }),

  riskAnalysis: () => ({
    riskLevel: 'Low',
    riskScore: 0,
    factors: { aggravating: [], mitigating: [] },
    recommendation: '',
    confidence: 0
  }),

  petitionEligibility: () => ({
    eligible: false,
    score: 0,
    probability: 0,
    reasoning: '',
    recommendations: [],
    factors: { positive: [], negative: [] },
    confidence: 0
  }),

  legalResearch: () => ({
    precedents: [],
    applicableLaws: [],
    relevantActs: [],
    confidence: 0
  }),

  strategy: () => ({
    primaryStrategy: '',
    nextSteps: [],
    timeline: [],
    alternativeApproaches: [],
    confidence: 0
  }),

  reportGenerator: () => ({
    title: '',
    executiveSummary: '',
    sections: [],
    recommendations: [],
    confidence: 0
  })
};

/**
 * Validate and merge agent output with schema defaults.
 * Ensures no null/undefined fields reach the frontend.
 */
function validateOutput(agentName, rawOutput) {
  const defaults = SCHEMAS[agentName] ? SCHEMAS[agentName]() : {};
  if (!rawOutput || typeof rawOutput !== 'object') return defaults;

  const merged = { ...defaults };
  for (const key of Object.keys(defaults)) {
    if (rawOutput[key] !== undefined && rawOutput[key] !== null) {
      merged[key] = rawOutput[key];
    }
  }
  return merged;
}

// ============================================================
// SHARED WORKFLOW STATE
// ============================================================

function createWorkflowState(caseData) {
  return {
    caseId: caseData._id?.toString() || null,
    input: {
      caseTitle: caseData.caseTitle || '',
      firNumber: caseData.firNumber || '',
      policeStation: caseData.policeStation || '',
      court: caseData.court || '',
      state: caseData.state || '',
      caseType: caseData.caseType || 'Criminal',
      ipcSections: (caseData.ipcSections || []).map(s => ({ section: s.section || '', description: s.description || '' })),
      extractedText: caseData.extractedText || '',
      metadata: caseData.metadata || {},
      documents: (caseData.uploadedDocuments || []).map(d => ({ filename: d.filename, originalName: d.originalName }))
    },
    agents: {},
    finalOutput: null,
    confidence: null,
    startedAt: new Date(),
    completedAt: null,
    totalDuration: 0
  };
}

// ============================================================
// INDIVIDUAL AGENT IMPLEMENTATIONS
// ============================================================

class ExtractionAgent {
  static run(state) {
    const { extractedText, ipcSections, metadata } = state.input;
    return validateOutput('extraction', {
      text: extractedText,
      pages: extractedText ? Math.ceil(extractedText.length / 3000) : 0,
      ipcSections: ipcSections.map(s => s.section),
      metadata,
      confidence: extractedText.length > 100 ? 0.85 : 0.4
    });
  }
}

class ClassificationAgent {
  static run(state) {
    const { caseType, court, ipcSections } = state.input;
    const seriousSections = ['302', '376', '395', '307', '304'];
    const hasSevere = ipcSections.some(s => seriousSections.includes(s.section));
    const severity = hasSevere ? 'High' : (ipcSections.length > 2 ? 'Medium' : 'Low');

    return validateOutput('classification', {
      caseType,
      category: caseType === 'Criminal' ? 'Criminal' : caseType === 'Civil' ? 'Civil' : 'Other',
      severity,
      subCategory: hasSevere ? 'Serious Offence' : 'General',
      confidence: 0.82
    });
  }
}

class IPCBNSAgent {
  static run(state) {
    const { ipcSections } = state.input;
    // Use the local mapping data from analysis controller
    const LOCAL_MAP = {
      '302':'101','304':'105','307':'109','376':'63','420':'316','498A':'84',
      '304B':'80','354':'74','379':'303','406':'316','323':'115','506':'351',
      '120B':'61','34':'3(5)','149':'190','147':'188','395':'310','304A':'106','509':'79'
    };

    const mappings = ipcSections.map(s => ({
      ipcSection: s.section,
      bnsSection: LOCAL_MAP[s.section] || 'Pending',
      mapped: !!LOCAL_MAP[s.section]
    }));

    return validateOutput('ipcBns', {
      mappings,
      totalMapped: mappings.filter(m => m.mapped).length,
      unmapped: mappings.filter(m => !m.mapped).map(m => m.ipcSection),
      confidence: mappings.length > 0 ? 0.88 : 0.3
    });
  }
}

class RiskAnalysisAgent {
  static run(state, classificationOutput) {
    const { ipcSections, court } = state.input;
    const severity = classificationOutput?.severity || 'Medium';

    const highRisk = ['302','376','395','307','304'];
    const medRisk = ['420','406','498A','354','323','506'];

    const aggravating = [];
    const mitigating = [];
    let score = 30;

    for (const s of ipcSections) {
      if (highRisk.includes(s.section)) { score += 20; aggravating.push(`IPC ${s.section} is a serious offence`); }
      else if (medRisk.includes(s.section)) { score += 10; aggravating.push(`IPC ${s.section} is a cognizable offence`); }
    }

    if (court === 'Supreme Court') { mitigating.push('Case in Supreme Court may have procedural safeguards'); score -= 5; }
    if (ipcSections.length <= 1) { mitigating.push('Single charge simplifies defense'); score -= 5; }

    score = Math.max(10, Math.min(95, score));
    const riskLevel = score >= 70 ? 'High' : score >= 45 ? 'Medium' : 'Low';

    return validateOutput('riskAnalysis', {
      riskLevel,
      riskScore: score,
      factors: { aggravating, mitigating },
      recommendation: riskLevel === 'High'
        ? 'Immediate legal counsel recommended. Consider bail strategy.'
        : riskLevel === 'Medium'
          ? 'Monitor case progress. Prepare defense documentation.'
          : 'Low urgency. Standard legal procedures apply.',
      confidence: 0.76
    });
  }
}

class PetitionEligibilityAgent {
  static run(state, riskOutput) {
    return validateOutput('petitionEligibility', aiFallback.evaluatePetitionEligibility({
      ipcSections: state.input.ipcSections,
      caseStatus: 'Pending',
      caseType: state.input.caseType,
      court: state.input.court
    }));
  }
}

class LegalResearchAgent {
  static run(state) {
    const { ipcSections, caseType } = state.input;
    const precedents = [];
    const applicableLaws = ['Indian Penal Code, 1860', 'Bharatiya Nyaya Sanhita, 2023', 'Code of Criminal Procedure, 1973'];

    if (ipcSections.some(s => s.section === '420')) {
      precedents.push({ title: 'Hridaya Ranjan Prasad Verma v. State of Bihar (2000)', relevance: 'Definition of cheating and dishonest intention' });
    }
    if (ipcSections.some(s => s.section === '302')) {
      precedents.push({ title: 'Bachan Singh v. State of Punjab (1980)', relevance: 'Rarest of rare doctrine for death penalty' });
    }
    if (ipcSections.some(s => s.section === '376')) {
      precedents.push({ title: 'Tukaram v. State of Maharashtra (1979)', relevance: 'Landmark case on consent in sexual assault' });
    }
    if (caseType === 'Civil') {
      applicableLaws.push('Civil Procedure Code, 1908');
    }

    return validateOutput('legalResearch', {
      precedents,
      applicableLaws,
      relevantActs: ['Constitution of India', 'Evidence Act, 1872', 'Bharatiya Sakshya Adhiniyam, 2023'],
      confidence: precedents.length > 0 ? 0.78 : 0.5
    });
  }
}

class StrategyAgent {
  static run(state, riskOutput, petitionOutput) {
    const riskLevel = riskOutput?.riskLevel || 'Medium';
    const eligible = petitionOutput?.eligible || false;

    const nextSteps = [
      'Review all case documents thoroughly',
      'Identify and preserve evidence',
      'Prepare witness statements'
    ];

    if (eligible) nextSteps.push('File petition at earliest opportunity');
    if (riskLevel === 'High') nextSteps.unshift('Engage senior counsel immediately');

    return validateOutput('strategy', {
      primaryStrategy: riskLevel === 'High'
        ? 'Aggressive defense with immediate bail application'
        : riskLevel === 'Medium'
          ? 'Balanced approach with focus on evidence and procedural compliance'
          : 'Standard defense with focus on case merits',
      nextSteps,
      timeline: [
        { phase: 'Immediate', action: 'Document review and evidence preservation', days: '1-3' },
        { phase: 'Short-term', action: 'Legal research and strategy formulation', days: '4-10' },
        { phase: 'Medium-term', action: 'Filing and court appearances', days: '11-30' }
      ],
      alternativeApproaches: [
        'Mediation/settlement if applicable',
        'Plea bargaining assessment',
        'Constitutional challenge if procedural violations found'
      ],
      confidence: 0.74
    });
  }
}

class ReportGeneratorAgent {
  static run(state, allOutputs) {
    const { input } = state;
    const { classification, riskAnalysis, petitionEligibility, legalResearch, strategy, ipcBns } = allOutputs;

    return validateOutput('reportGenerator', {
      title: `Legal Intelligence Report: ${input.caseTitle}`,
      executiveSummary: `This ${(classification?.caseType || input.caseType).toLowerCase()} case (FIR: ${input.firNumber}) filed at ${input.policeStation} police station, ${input.state}, involves ${input.ipcSections.length} IPC section(s). Risk assessment: ${riskAnalysis?.riskLevel || 'N/A'}. Petition eligibility score: ${petitionEligibility?.score || 0}/100.`,
      sections: [
        { title: 'Case Classification', content: classification },
        { title: 'IPC to BNS Mapping', content: ipcBns },
        { title: 'Risk Assessment', content: riskAnalysis },
        { title: 'Petition Eligibility', content: petitionEligibility },
        { title: 'Legal Research', content: legalResearch },
        { title: 'Legal Strategy', content: strategy }
      ],
      recommendations: strategy?.nextSteps || [],
      confidence: 0.80
    });
  }
}

// ============================================================
// MAIN ORCHESTRATOR CLASS
// ============================================================

class LegalWorkflowOrchestrator {
  constructor() {
    this.maxRetries = 2;
  }

  /**
   * Execute the full multi-agent workflow for a case.
   * Returns structured analysis with all agent outputs merged.
   */
  async analyzeCase(caseData) {
    const state = createWorkflowState(caseData);
    logger.info(`[Orchestrator] Starting workflow for case: ${state.input.firNumber}`);

    try {
      // Agent 1: Extraction
      state.agents.extraction = this._runAgent('extraction', () => ExtractionAgent.run(state));

      // Agent 2: Classification (depends on extraction)
      state.agents.classification = this._runAgent('classification', () => ClassificationAgent.run(state));

      // Agent 3: IPC/BNS Mapping
      state.agents.ipcBns = this._runAgent('ipcBns', () => IPCBNSAgent.run(state));

      // Agent 4: Risk Analysis (depends on classification)
      state.agents.riskAnalysis = this._runAgent('riskAnalysis', () =>
        RiskAnalysisAgent.run(state, state.agents.classification.output)
      );

      // Agent 5: Petition Eligibility (depends on risk)
      state.agents.petitionEligibility = this._runAgent('petitionEligibility', () =>
        PetitionEligibilityAgent.run(state, state.agents.riskAnalysis.output)
      );

      // Agent 6: Legal Research
      state.agents.legalResearch = this._runAgent('legalResearch', () => LegalResearchAgent.run(state));

      // Agent 7: Strategy (depends on risk + petition)
      state.agents.strategy = this._runAgent('strategy', () =>
        StrategyAgent.run(state, state.agents.riskAnalysis.output, state.agents.petitionEligibility.output)
      );

      // Agent 8: Report Generator (combines all)
      const allOutputs = {
        classification: state.agents.classification.output,
        ipcBns: state.agents.ipcBns.output,
        riskAnalysis: state.agents.riskAnalysis.output,
        petitionEligibility: state.agents.petitionEligibility.output,
        legalResearch: state.agents.legalResearch.output,
        strategy: state.agents.strategy.output
      };
      state.agents.reportGenerator = this._runAgent('reportGenerator', () =>
        ReportGeneratorAgent.run(state, allOutputs)
      );

      // Compute final confidence
      state.confidence = ConfidenceCalculator.calculateCaseConfidence(caseData, {
        summary: state.agents.reportGenerator.output?.executiveSummary || '',
        keyFindings: state.agents.strategy.output?.nextSteps || [],
        legalInsights: state.agents.legalResearch.output?.applicableLaws || [],
        riskLevel: state.agents.riskAnalysis.output?.riskLevel,
        metadata: { agentsUsed: Object.keys(state.agents).filter(k => state.agents[k].status === STATUS.COMPLETED) }
      });

      // Build final output (what gets saved to case.aiAnalysis)
      state.finalOutput = this._buildFinalOutput(state);
      state.completedAt = new Date();
      state.totalDuration = state.completedAt - state.startedAt;

      logger.info(`[Orchestrator] Workflow complete for ${state.input.firNumber} in ${state.totalDuration}ms`);
      return state.finalOutput;

    } catch (error) {
      logger.error(`[Orchestrator] Workflow failed: ${error.message}`);
      // Return fallback analysis so the case still gets marked as analyzed
      return aiFallback.generateCaseAnalysis(caseData);
    }
  }

  /**
   * Run a single agent with error handling and timing.
   */
  _runAgent(name, fn) {
    const start = Date.now();
    try {
      const output = fn();
      return { status: STATUS.COMPLETED, output, error: null, duration: Date.now() - start };
    } catch (error) {
      logger.warn(`[Agent:${name}] Failed: ${error.message}`);
      const defaults = SCHEMAS[name] ? SCHEMAS[name]() : {};
      return { status: STATUS.FAILED, output: defaults, error: error.message, duration: Date.now() - start };
    }
  }

  /**
   * Build the final structured output that gets saved to the database.
   * This is the schema that the frontend reads from case.aiAnalysis.
   */
  _buildFinalOutput(state) {
    const risk = state.agents.riskAnalysis.output || SCHEMAS.riskAnalysis();
    const classification = state.agents.classification.output || SCHEMAS.classification();
    const petition = state.agents.petitionEligibility.output || SCHEMAS.petitionEligibility();
    const research = state.agents.legalResearch.output || SCHEMAS.legalResearch();
    const strategy = state.agents.strategy.output || SCHEMAS.strategy();
    const report = state.agents.reportGenerator.output || SCHEMAS.reportGenerator();
    const ipcBns = state.agents.ipcBns.output || SCHEMAS.ipcBns();

    return {
      analyzed: true,
      analyzedAt: new Date(),
      summary: report.executiveSummary || `Case ${state.input.caseTitle} analyzed successfully.`,
      keyFindings: [
        `Case Type: ${classification.caseType} (${classification.severity} severity)`,
        `Risk Level: ${risk.riskLevel} (Score: ${risk.riskScore}/100)`,
        `IPC Sections Mapped to BNS: ${ipcBns.totalMapped}/${state.input.ipcSections.length}`,
        `Petition Eligibility: ${petition.eligible ? 'Eligible' : 'Not Eligible'} (Score: ${petition.score}/100)`,
        ...(risk.factors.aggravating.length > 0 ? [`Aggravating factors: ${risk.factors.aggravating.length}`] : [])
      ],
      riskLevel: risk.riskLevel,
      riskScore: risk.riskScore,
      legalInsights: [
        strategy.primaryStrategy,
        risk.recommendation,
        ...(research.applicableLaws.slice(0, 3).map(l => `Applicable: ${l}`))
      ].filter(Boolean),
      similarCases: research.precedents.map(p => ({ title: p.title, relevance: p.relevance })),
      retrialProbability: risk.riskScore > 60 ? 45 : 20,
      confidence: state.confidence,
      // Extended structured data for detailed views
      classification,
      ipcBnsMappings: ipcBns.mappings,
      petitionEligibility: petition,
      legalResearch: research,
      strategy,
      report,
      // Metadata
      metadata: {
        processingTime: state.totalDuration || 0,
        agentsUsed: Object.keys(state.agents).filter(k => state.agents[k].status === STATUS.COMPLETED),
        agentsFailed: Object.keys(state.agents).filter(k => state.agents[k].status === STATUS.FAILED),
        modelVersion: 'orchestrator-2.0',
        timestamp: new Date()
      }
    };
  }

  /**
   * Try CrewAI first, fall back to local orchestration.
   * This is the main entry point called by the analysis controller.
   */
  async analyzeCaseWithFallback(caseData) {
    try {
      // Try CrewAI external service first
      const result = await crewAIService.analyzeCaseWithCrewAI(caseData);
      logger.info(`[Orchestrator] CrewAI succeeded for ${caseData.firNumber}`);
      return result;
    } catch (error) {
      logger.warn(`[Orchestrator] CrewAI failed, running local agents: ${error.message}`);
      return this.analyzeCase(caseData);
    }
  }
}

// Singleton
const orchestrator = new LegalWorkflowOrchestrator();

module.exports = orchestrator;
module.exports.createWorkflowState = createWorkflowState;
module.exports.validateOutput = validateOutput;
module.exports.SCHEMAS = SCHEMAS;
module.exports.STATUS = STATUS;
