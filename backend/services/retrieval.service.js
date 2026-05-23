/**
 * Case Retrieval Service
 * Provides semantic-like search over stored cases using MongoDB text search,
 * keyword extraction, and structured context assembly.
 *
 * This replaces the need for a separate vector DB by leveraging:
 * 1. MongoDB text indexes (already created on Case model)
 * 2. Keyword-based relevance scoring
 * 3. Structured context assembly from stored agent outputs
 *
 * For production scale (10K+ cases), upgrade to MongoDB Atlas Vector Search
 * or add Pinecone integration.
 */

const Case = require('../models/Case.model');
const logger = require('../utils/logger');

class RetrievalService {
  /**
   * Search for relevant cases given a user query.
   * Returns structured context chunks ready for AI consumption.
   */
  async retrieveContext(query, userId = null, limit = 3) {
    try {
      // First try user-scoped search, then global
      let cases = await this._searchCases(query, userId, limit);
      if (cases.length === 0 && userId) {
        cases = await this._searchCases(query, null, limit);
      }
      if (cases.length === 0) return { found: false, chunks: [], cases: [] };

      const chunks = [];
      const caseRefs = [];

      for (const caseDoc of cases) {
        caseRefs.push({
          id: caseDoc._id,
          title: caseDoc.caseTitle,
          firNumber: caseDoc.firNumber,
          status: caseDoc.caseStatus
        });

        // Chunk 1: Case metadata
        chunks.push({
          type: 'case_metadata',
          caseId: caseDoc._id.toString(),
          content: `Case: ${caseDoc.caseTitle} | FIR: ${caseDoc.firNumber} | Court: ${caseDoc.court} | State: ${caseDoc.state} | Type: ${caseDoc.caseType} | Status: ${caseDoc.caseStatus}`
        });

        // Chunk 2: IPC Sections
        if (caseDoc.ipcSections && caseDoc.ipcSections.length > 0) {
          chunks.push({
            type: 'ipc_sections',
            caseId: caseDoc._id.toString(),
            content: `IPC Sections: ${caseDoc.ipcSections.map(s => `Section ${s.section}${s.description ? ' (' + s.description + ')' : ''}`).join(', ')}`
          });
        }

        // Chunk 3: AI Analysis summary
        if (caseDoc.aiAnalysis && caseDoc.aiAnalysis.analyzed) {
          const ai = caseDoc.aiAnalysis;
          chunks.push({
            type: 'ai_analysis',
            caseId: caseDoc._id.toString(),
            content: `AI Analysis: ${ai.summary || 'Analyzed'} | Risk: ${ai.riskLevel || 'N/A'} | Findings: ${(ai.keyFindings || []).join('; ')} | Insights: ${(ai.legalInsights || []).join('; ')}`
          });
        }

        // Chunk 4: Petition eligibility
        if (caseDoc.petitionEligibility && caseDoc.petitionEligibility.score > 0) {
          const pe = caseDoc.petitionEligibility;
          chunks.push({
            type: 'petition_eligibility',
            caseId: caseDoc._id.toString(),
            content: `Petition Eligibility: ${pe.eligible ? 'Eligible' : 'Not Eligible'} | Score: ${pe.score}/100 | Reasoning: ${pe.reasoning || 'N/A'}`
          });
        }

        // Chunk 5: BNS Mappings
        if (caseDoc.bnsMappings && caseDoc.bnsMappings.length > 0) {
          chunks.push({
            type: 'bns_mappings',
            caseId: caseDoc._id.toString(),
            content: `BNS Mappings: ${caseDoc.bnsMappings.map(m => `IPC ${m.ipcSection} → BNS ${m.bnsSection}`).join(', ')}`
          });
        }

        // Chunk 6: Extracted text (first 500 chars for context)
        if (caseDoc.extractedText && caseDoc.extractedText.length > 50) {
          chunks.push({
            type: 'extracted_text',
            caseId: caseDoc._id.toString(),
            content: `Document Text (excerpt): ${caseDoc.extractedText.substring(0, 500)}`
          });
        }
      }

      return { found: true, chunks, cases: caseRefs };
    } catch (error) {
      logger.error(`Retrieval error: ${error.message}`);
      return { found: false, chunks: [], cases: [] };
    }
  }

  /**
   * Search cases using multiple strategies:
   * 1. MongoDB text search (uses text index on caseTitle, extractedText, aiAnalysis.summary)
   * 2. Regex fallback on title/firNumber
   * 3. User-scoped search if userId provided
   */
  async _searchCases(query, userId, limit) {
    let cases = [];

    // Strategy 1: Full-text search
    try {
      const filter = { $text: { $search: query } };
      if (userId) filter.uploadedBy = userId;
      cases = await Case.find(filter)
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .select('caseTitle firNumber court state caseType caseStatus ipcSections aiAnalysis petitionEligibility bnsMappings extractedText');
      if (cases.length > 0) return cases;
    } catch (e) {
      // Text search may fail if no text index, continue to fallback
    }

    // Strategy 2: Regex search on title and FIR
    const words = query.split(/\s+/).filter(w => w.length > 2);
    if (words.length > 0) {
      const pattern = words.slice(0, 5).join('|');
      const filter = {
        $or: [
          { caseTitle: { $regex: pattern, $options: 'i' } },
          { firNumber: { $regex: pattern, $options: 'i' } },
          { 'aiAnalysis.summary': { $regex: pattern, $options: 'i' } }
        ]
      };
      if (userId) filter.uploadedBy = userId;
      cases = await Case.find(filter)
        .limit(limit)
        .select('caseTitle firNumber court state caseType caseStatus ipcSections aiAnalysis petitionEligibility bnsMappings extractedText');
    }

    return cases;
  }

  /**
   * Build a context string from retrieved chunks for injection into AI prompt.
   */
  buildContextString(chunks, maxLength = 2000) {
    let context = '';
    for (const chunk of chunks) {
      const line = `[${chunk.type}] ${chunk.content}\n`;
      if (context.length + line.length > maxLength) break;
      context += line;
    }
    return context;
  }

  /**
   * Store a chat message for history (simple MongoDB approach).
   * For production, consider a dedicated ChatHistory model.
   */
  async storeChatMessage(userId, message, response, caseId = null) {
    // This could be expanded to a full ChatHistory model
    // For now, we log it for debugging
    logger.info(`[Chat] User ${userId}: "${message.substring(0, 50)}..." → response generated`);
  }
}

module.exports = new RetrievalService();
