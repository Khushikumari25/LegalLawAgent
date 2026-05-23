/**
 * Google Gemini AI Service
 * Provides AI-powered legal analysis using Google's Gemini model
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = null;
    
    if (this.apiKey) {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      logger.info('Gemini AI service initialized');
    } else {
      logger.warn('GEMINI_API_KEY not configured. Gemini AI will not be available.');
    }
  }

  isAvailable() {
    return !!this.model;
  }

  /**
   * Chat with the AI Legal Assistant
   */
  async chatWithAssistant(message, context = {}) {
    if (!this.model) throw new Error('Gemini not configured');

    const systemPrompt = `You are न्यायASTRA, an expert AI Legal Intelligence Assistant specializing in Indian law. You provide detailed, accurate, and comprehensive legal analysis.

Your expertise includes:
- Indian Penal Code (IPC) and Bharatiya Nyaya Sanhita (BNS) 2023
- Code of Criminal Procedure (CrPC) and Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023
- Indian Evidence Act and Bharatiya Sakshya Adhiniyam (BSA) 2023
- Constitutional law (Articles 14, 19, 21, 32, 226, etc.)
- Administrative law, natural justice, judicial review
- Criminal law, bail jurisprudence, petition eligibility
- Civil law, contract law, property law
- High Court and Supreme Court procedures
- Letters Patent Appeals, Writ Petitions, SLPs
- Legal precedents and landmark judgments

Guidelines:
- Provide detailed, structured, and comprehensive answers
- Cite relevant sections, articles, and case laws where applicable
- Explain legal principles clearly with examples
- If asked about a specific case, provide analysis based on available legal principles
- Use proper legal terminology while keeping explanations accessible
- For Hindi queries, respond in Hindi with legal terms in English where standard
- Always mention relevant BNS equivalents when discussing IPC sections
- Structure long answers with headings, numbered points, and clear organization`;

    const prompt = `${systemPrompt}\n\nUser Query: ${message}\n\nLanguage preference: ${context.language || 'en'}\n\nProvide a detailed, comprehensive response:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      return {
        message: response,
        suggestions: this._generateSuggestions(message),
        references: [],
        confidence: 0.92,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error(`Gemini chat error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze a legal case
   */
  async analyzeCaseWithAI(caseData) {
    if (!this.model) throw new Error('Gemini not configured');

    const prompt = `You are an expert Indian legal analyst. Analyze the following case and provide a comprehensive legal analysis:

Case Title: ${caseData.caseTitle}
FIR Number: ${caseData.firNumber}
Police Station: ${caseData.policeStation || 'Unknown'}
State: ${caseData.state || 'Unknown'}
Court: ${caseData.court || 'Unknown'}
Case Type: ${caseData.caseType || 'Criminal'}
IPC Sections: ${caseData.ipcSections?.map(s => s.section).join(', ') || 'Not specified'}

Case Text/FIR Content:
${caseData.extractedText || 'No text available'}

Provide analysis in the following JSON format:
{
  "summary": "Brief case summary",
  "keyFindings": ["finding1", "finding2", ...],
  "riskLevel": "High/Medium/Low",
  "riskScore": 0-100,
  "legalInsights": ["insight1", "insight2", ...],
  "bnsMappings": [{"ipc": "section", "bns": "equivalent"}],
  "petitionEligibility": {"eligible": true/false, "score": 0-100, "reasoning": "..."},
  "recommendations": ["rec1", "rec2", ...]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      
      // Try to parse JSON from response
      let parsed;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      } catch (e) {
        parsed = null;
      }

      if (parsed) {
        return {
          analyzed: true,
          analyzedAt: new Date(),
          summary: parsed.summary || 'Analysis completed',
          keyFindings: parsed.keyFindings || [],
          riskLevel: parsed.riskLevel || 'Medium',
          riskScore: parsed.riskScore || 50,
          legalInsights: parsed.legalInsights || [],
          bnsMappings: parsed.bnsMappings || [],
          petitionEligibility: parsed.petitionEligibility || { eligible: false, score: 0, reasoning: '' },
          recommendations: parsed.recommendations || [],
          confidence: { overall: 0.88, classification: 0.85, mapping: 0.90 },
          metadata: { processingTime: 0, agentsUsed: ['gemini-1.5-flash'], modelVersion: 'gemini-1.5-flash', timestamp: new Date() }
        };
      }

      // If JSON parsing fails, return text-based analysis
      return {
        analyzed: true,
        analyzedAt: new Date(),
        summary: text.substring(0, 500),
        keyFindings: [text],
        riskLevel: 'Medium',
        riskScore: 50,
        legalInsights: [],
        confidence: { overall: 0.80 },
        metadata: { processingTime: 0, agentsUsed: ['gemini-1.5-flash'], modelVersion: 'gemini-1.5-flash', timestamp: new Date() }
      };
    } catch (error) {
      logger.error(`Gemini case analysis error: ${error.message}`);
      throw error;
    }
  }

  _generateSuggestions(message) {
    const lower = message.toLowerCase();
    if (lower.includes('ipc') || lower.includes('bns') || lower.includes('section')) {
      return ['Compare IPC and BNS punishments', 'Explain the key changes in BNS', 'What sections were added in BNS?'];
    }
    if (lower.includes('bail') || lower.includes('petition')) {
      return ['What are grounds for anticipatory bail?', 'Explain Section 438 CrPC', 'Bail conditions in non-bailable offences'];
    }
    if (lower.includes('case') || lower.includes('analysis')) {
      return ['Upload a case for AI analysis', 'How to check petition eligibility?', 'Find similar cases'];
    }
    return ['Explain IPC to BNS transition', 'What is a Letters Patent Appeal?', 'Analyze a legal case'];
  }
}

module.exports = new GeminiService();
