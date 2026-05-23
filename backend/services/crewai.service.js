/**
 * CrewAI Integration Service
 * Connects to deployed CrewAI Legal Intelligence Multi-Agent System
 */

const axios = require('axios');
const logger = require('../utils/logger');

class CrewAIService {
  constructor() {
    this.baseURL = process.env.CREWAI_API_URL || 'https://enterprise-ai-legal-intelligence-platform-c-32c1ec28.crewai.com';
    this.bearerToken = process.env.CREWAI_BEARER_TOKEN;
    this.userBearerToken = process.env.CREWAI_USER_BEARER_TOKEN;
    this.timeout = 120000; // 2 minutes timeout for AI processing

    if (!this.bearerToken) {
      logger.warn('CREWAI_BEARER_TOKEN not configured. CrewAI integration may fail.');
    }
  }

  /**
   * Get API headers with Bearer Token authentication
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    // Use Bearer Token authentication (primary token)
    if (this.bearerToken) {
      headers['Authorization'] = `Bearer ${this.bearerToken}`;
    }

    // Add User Bearer Token if available (for user-specific operations)
    if (this.userBearerToken) {
      headers['X-User-Token'] = this.userBearerToken;
    }

    return headers;
  }

  /**
   * Kickoff CrewAI workflow for case analysis
   * @param {Object} caseData - Case data to analyze
   * @returns {Promise<Object>} AI analysis results
   */
  async analyzeCaseWithCrewAI(caseData) {
    try {
      logger.info(`Starting CrewAI analysis for case: ${caseData.firNumber}`);

      const payload = {
        inputs: {
          case_text: caseData.extractedText || '',
          case_title: caseData.caseTitle,
          fir_number: caseData.firNumber,
          jurisdiction: caseData.state || 'Unknown',
          case_type: caseData.caseType || 'Criminal',
          police_station: caseData.policeStation,
          court: caseData.court,
          state: caseData.state,
          ipc_sections: caseData.ipcSections?.map(s => s.section).join(', ') || '',
          metadata: {
            dateOfIncident: caseData.metadata?.dateOfIncident,
            accused: caseData.metadata?.accused,
            victims: caseData.metadata?.victims
          }
        }
      };

      const response = await axios.post(
        `${this.baseURL}/kickoff`,
        payload,
        {
          headers: this.getHeaders(),
          timeout: this.timeout
        }
      );

      logger.info(`CrewAI analysis completed for case: ${caseData.firNumber}`);

      return this.parseCrewAIResponse(response.data);
    } catch (error) {
      logger.error(`CrewAI analysis error: ${error.message}`);
      
      if (error.response) {
        logger.error(`CrewAI API Error: ${JSON.stringify(error.response.data)}`);
        throw new Error(`CrewAI API Error: ${error.response.data.message || error.message}`);
      }
      
      throw new Error(`Failed to analyze case with CrewAI: ${error.message}`);
    }
  }

  /**
   * Parse and structure CrewAI response
   * @param {Object} rawResponse - Raw response from CrewAI
   * @returns {Object} Structured analysis
   */
  parseCrewAIResponse(rawResponse) {
    try {
      // Extract data from CrewAI response
      const data = rawResponse.output || rawResponse;

      return {
        analyzed: true,
        analyzedAt: new Date(),
        
        // Case Classification
        caseClassification: {
          status: data.case_status || 'Pending',
          category: data.case_category || 'Criminal',
          severity: data.severity || 'Medium',
          confidence: data.confidence_score || 0.85
        },

        // Summary and Key Findings
        summary: data.case_summary || data.summary || 'AI-generated case analysis completed',
        keyFindings: data.key_findings || data.findings || [],

        // IPC Sections Analysis
        ipcAnalysis: data.ipc_analysis || {
          sections: data.ipc_sections || [],
          descriptions: data.ipc_descriptions || []
        },

        // BNS Mapping
        bnsMappings: data.bns_mappings || data.bns_mapping || [],

        // Risk Assessment
        riskLevel: data.risk_level || data.risk || 'Medium',
        riskScore: data.risk_score || 50,

        // Similar Cases
        similarCases: data.related_cases || data.similar_cases || [],

        // Legal Insights
        legalInsights: data.legal_insights || data.recommendations || [],

        // Petition Eligibility (if included)
        petitionEligibility: {
          eligible: data.petition_eligible || false,
          probability: data.petition_probability || 0,
          score: data.petition_score || 0,
          reasoning: data.petition_reasoning || ''
        },

        // Retrial Probability
        retrialProbability: data.retrial_probability || data.retrial_score || 0,

        // Confidence Metrics
        confidence: {
          overall: data.confidence_score || 0.85,
          classification: data.classification_confidence || 0.85,
          mapping: data.mapping_confidence || 0.85
        },

        // Raw AI Output (for debugging)
        rawOutput: data,

        // Processing Metadata
        metadata: {
          processingTime: data.processing_time || 0,
          agentsUsed: data.agents_used || [],
          modelVersion: data.model_version || '1.0',
          timestamp: new Date()
        }
      };
    } catch (error) {
      logger.error(`Error parsing CrewAI response: ${error.message}`);
      throw new Error('Failed to parse AI analysis results');
    }
  }

  /**
   * Get IPC to BNS mapping using CrewAI
   * @param {string} ipcSection - IPC section number
   * @returns {Promise<Object>} BNS mapping
   */
  async getIPCToBNSMapping(ipcSection) {
    try {
      logger.info(`Getting BNS mapping for IPC section: ${ipcSection}`);

      const payload = {
        inputs: {
          ipc_section: ipcSection,
          action: 'ipc_to_bns_mapping'
        }
      };

      const response = await axios.post(
        `${this.baseURL}/kickoff`,
        payload,
        {
          headers: this.getHeaders(),
          timeout: 30000 // 30 seconds for mapping
        }
      );

      const data = response.data.output || response.data;

      return {
        ipcSection: ipcSection,
        ipcDescription: data.ipc_description || '',
        ipcPunishment: data.ipc_punishment || '',
        bnsSection: data.bns_section || '',
        bnsDescription: data.bns_description || '',
        bnsPunishment: data.bns_punishment || '',
        mappingType: data.mapping_type || 'Direct',
        changes: data.changes || 'No major changes',
        impactAnalysis: data.impact_analysis || {},
        confidence: data.confidence || 0.9
      };
    } catch (error) {
      logger.error(`IPC to BNS mapping error: ${error.message}`);
      throw new Error(`Failed to get BNS mapping: ${error.message}`);
    }
  }

  /**
   * Evaluate petition eligibility using CrewAI
   * @param {Object} caseData - Case data
   * @returns {Promise<Object>} Eligibility evaluation
   */
  async evaluatePetitionEligibility(caseData) {
    try {
      logger.info(`Evaluating petition eligibility for case: ${caseData.firNumber}`);

      const payload = {
        inputs: {
          case_text: caseData.extractedText || '',
          case_title: caseData.caseTitle,
          ipc_sections: caseData.ipcSections?.map(s => s.section).join(', ') || '',
          case_status: caseData.caseStatus,
          court: caseData.court,
          action: 'petition_eligibility'
        }
      };

      const response = await axios.post(
        `${this.baseURL}/kickoff`,
        payload,
        {
          headers: this.getHeaders(),
          timeout: 60000 // 1 minute
        }
      );

      const data = response.data.output || response.data;

      return {
        eligible: data.petition_eligible || data.eligible || false,
        score: data.petition_score || data.score || 0,
        probability: data.petition_probability || 0,
        reasoning: data.petition_reasoning || data.reasoning || '',
        recommendations: data.recommendations || [],
        factors: {
          positive: data.positive_factors || [],
          negative: data.negative_factors || []
        },
        confidence: data.confidence || 0.85,
        evaluatedAt: new Date()
      };
    } catch (error) {
      logger.error(`Petition eligibility evaluation error: ${error.message}`);
      throw new Error(`Failed to evaluate petition eligibility: ${error.message}`);
    }
  }

  /**
   * Chat with AI Legal Assistant
   * @param {string} message - User message
   * @param {Object} context - Conversation context
   * @returns {Promise<Object>} AI response
   */
  async chatWithAssistant(message, context = {}) {
    try {
      logger.info(`AI Assistant query: ${message.substring(0, 50)}...`);

      const payload = {
        inputs: {
          user_message: message,
          context: context,
          action: 'legal_assistant'
        }
      };

      const response = await axios.post(
        `${this.baseURL}/kickoff`,
        payload,
        {
          headers: this.getHeaders(),
          timeout: 45000 // 45 seconds
        }
      );

      const data = response.data.output || response.data;

      return {
        message: data.assistant_response || data.response || 'I can help you with legal queries.',
        suggestions: data.suggestions || [],
        references: data.references || [],
        confidence: data.confidence || 0.9,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error(`AI Assistant error: ${error.message}`);
      throw new Error(`Failed to get AI response: ${error.message}`);
    }
  }

  /**
   * Find similar cases using CrewAI
   * @param {Object} caseData - Case data
   * @returns {Promise<Array>} Similar cases
   */
  async findSimilarCases(caseData) {
    try {
      logger.info(`Finding similar cases for: ${caseData.firNumber}`);

      const payload = {
        inputs: {
          case_text: caseData.extractedText || '',
          ipc_sections: caseData.ipcSections?.map(s => s.section).join(', ') || '',
          case_type: caseData.caseType,
          action: 'find_similar_cases'
        }
      };

      const response = await axios.post(
        `${this.baseURL}/kickoff`,
        payload,
        {
          headers: this.getHeaders(),
          timeout: 45000
        }
      );

      const data = response.data.output || response.data;

      return data.similar_cases || data.related_cases || [];
    } catch (error) {
      logger.error(`Find similar cases error: ${error.message}`);
      throw new Error(`Failed to find similar cases: ${error.message}`);
    }
  }

  /**
   * Check CrewAI API health
   * @returns {Promise<boolean>} API health status
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        headers: this.getHeaders(),
        timeout: 5000
      });

      return response.status === 200;
    } catch (error) {
      logger.error(`CrewAI health check failed: ${error.message}`);
      return false;
    }
  }
}

// Export singleton instance
module.exports = new CrewAIService();
