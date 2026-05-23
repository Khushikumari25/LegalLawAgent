/**
 * Confidence Score Calculator
 * Generates real confidence scores based on multiple factors
 */

class ConfidenceCalculator {
  /**
   * Calculate overall confidence for case analysis
   * @param {Object} caseData - The case data
   * @param {Object} analysisResult - The analysis output
   * @returns {Object} Confidence breakdown
   */
  static calculateCaseConfidence(caseData, analysisResult = {}) {
    const factors = {};

    // Factor 1: Data completeness (0-1)
    const requiredFields = ['caseTitle', 'firNumber', 'policeStation', 'court', 'state', 'caseType'];
    const filledFields = requiredFields.filter(f => caseData[f] && caseData[f].toString().trim());
    factors.dataCompleteness = filledFields.length / requiredFields.length;

    // Factor 2: Document availability (0-1)
    const hasDocuments = (caseData.uploadedDocuments && caseData.uploadedDocuments.length > 0) ? 1 : 0.4;
    const hasExtractedText = (caseData.extractedText && caseData.extractedText.length > 50) ? 1 : 0.3;
    factors.documentQuality = (hasDocuments + hasExtractedText) / 2;

    // Factor 3: IPC section identification (0-1)
    const ipcSections = caseData.ipcSections || [];
    factors.sectionIdentification = ipcSections.length > 0 ? Math.min(1, 0.5 + (ipcSections.length * 0.1)) : 0.2;

    // Factor 4: Analysis depth (0-1)
    let analysisDepth = 0.5; // base
    if (analysisResult.summary && analysisResult.summary.length > 100) analysisDepth += 0.15;
    if (analysisResult.keyFindings && analysisResult.keyFindings.length > 0) analysisDepth += 0.15;
    if (analysisResult.legalInsights && analysisResult.legalInsights.length > 0) analysisDepth += 0.1;
    if (analysisResult.riskLevel) analysisDepth += 0.1;
    factors.analysisDepth = Math.min(1, analysisDepth);

    // Factor 5: Source reliability (0-1)
    // CrewAI = 0.9, Fallback = 0.65
    const isCrewAI = analysisResult.metadata?.agentsUsed?.includes('local-analysis-engine') === false;
    factors.sourceReliability = isCrewAI ? 0.9 : 0.65;

    // Weighted average
    const weights = {
      dataCompleteness: 0.2,
      documentQuality: 0.25,
      sectionIdentification: 0.15,
      analysisDepth: 0.2,
      sourceReliability: 0.2
    };

    let overall = 0;
    for (const [key, weight] of Object.entries(weights)) {
      overall += (factors[key] || 0) * weight;
    }

    // Clamp between 0.15 and 0.98
    overall = Math.max(0.15, Math.min(0.98, overall));

    return {
      overall: parseFloat(overall.toFixed(3)),
      classification: parseFloat((overall * 1.05).toFixed(3)),
      mapping: parseFloat((overall * 0.95).toFixed(3)),
      factors
    };
  }

  /**
   * Calculate confidence for chatbot response
   */
  static calculateChatConfidence(message, responseType) {
    let base = 0.7;
    if (responseType === 'crewai') base = 0.9;
    if (responseType === 'case_context') base = 0.85;
    if (responseType === 'fallback') base = 0.72;
    // Longer, more specific queries get slightly higher confidence
    if (message.length > 50) base += 0.03;
    return parseFloat(Math.min(0.95, base).toFixed(3));
  }
}

module.exports = ConfidenceCalculator;
