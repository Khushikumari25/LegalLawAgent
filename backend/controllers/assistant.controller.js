const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');
const crewAIService = require('../services/crewai.service');
const aiFallback = require('../services/ai-fallback.service');
const retrievalService = require('../services/retrieval.service');
const ConfidenceCalculator = require('../utils/confidenceScore');

// ============================================================
// MAIN CHAT HANDLER
// ============================================================
exports.chat = async (req, res, next) => {
  try {
    const { message, context } = req.body;
    if (!message || !message.trim()) return ApiResponse.badRequest(res, 'Message is required');

    const trimmedMessage = message.trim();
    const language = (context && context.language) || 'en';
    let response, responseType = 'fallback';

    // Determine if general query or case-specific
    const isGeneralQuery = /^(what is|explain|define|how to|how does|compare|kya hai|samjhao|batao$)/i.test(trimmedMessage)
      && !/(case|केस|dabur|kumar|sharma|uploaded)/i.test(trimmedMessage);

    if (!isGeneralQuery) {
      const retrieval = await retrievalService.retrieveContext(trimmedMessage, req.user.id, 2);
      if (retrieval.found && retrieval.chunks.length > 0) {
        response = buildResponse(trimmedMessage, retrieval, language);
        responseType = 'retrieval';
        logger.info(`AI chat (retrieval, lang:${language}) for ${req.user.email}`);
      }
    }

    if (!response) {
      try {
        response = await crewAIService.chatWithAssistant(trimmedMessage, context || {});
        responseType = 'crewai';
      } catch (aiError) {
        logger.warn(`CrewAI unavailable: ${aiError.message}`);
        response = generateFallback(trimmedMessage, language);
        responseType = 'fallback';
      }
    }

    if (!response.confidence) {
      response.confidence = ConfidenceCalculator.calculateChatConfidence(trimmedMessage, responseType);
    }

    return ApiResponse.success(res, { response }, 'Chat response generated');
  } catch (error) {
    logger.error(`Chat error: ${error.message}`);
    return ApiResponse.success(res, { response: { message: 'Error occurred. Please try again.', suggestions: [], references: [], confidence: 0.1, timestamp: new Date() } }, 'Chat response generated');
  }
};

// ============================================================
// RESPONSE BUILDER — generates native Hindi/English
// ============================================================
function buildResponse(message, retrieval, lang) {
  const lowerMsg = message.toLowerCase();
  const chunks = retrieval.chunks;
  const c = retrieval.cases[0]; // primary case

  // Extract data
  let court='', state='', caseType='', status='', riskLevel='', findings='', insights='';
  const meta = chunks.find(x => x.type === 'case_metadata');
  const analysis = chunks.find(x => x.type === 'ai_analysis');
  if (meta) { const p = meta.content.split('|').map(s=>s.trim()); p.forEach(s => { if(s.startsWith('Court:'))court=s.slice(6).trim(); if(s.startsWith('State:'))state=s.slice(6).trim(); if(s.startsWith('Type:'))caseType=s.slice(5).trim(); if(s.startsWith('Status:'))status=s.slice(7).trim(); }); }
  if (analysis) { const p = analysis.content.replace('AI Analysis:','').split('|').map(s=>s.trim()); p.forEach(s => { if(s.startsWith('Risk:'))riskLevel=s.slice(5).trim(); if(s.startsWith('Findings:'))findings=s.slice(9).trim(); if(s.startsWith('Insights:'))insights=s.slice(9).trim(); }); }

  const isRisk = /risk|जोखिम|khatr/i.test(lowerMsg);
  const isPetition = /petition|याचिका|bail|जमानत|eligib|पात्र/i.test(lowerMsg);
  const isIPC = /ipc|bns|धारा|section/i.test(lowerMsg);

  let text = '';
  let suggestions = [];

  if (lang === 'hi') {
    const riskHi = riskLevel==='High'?'उच्च':riskLevel==='Medium'?'मध्यम':'निम्न';
    const statusHi = status==='Analyzed'?'विश्लेषित':status==='Pending'?'लंबित':status;
    const typeHi = caseType==='Criminal'?'आपराधिक':caseType==='Civil'?'दीवानी':caseType;
    const courtHi = court==='High Court'?'उच्च न्यायालय':court==='Supreme Court'?'सर्वोच्च न्यायालय':court==='District Court'?'जिला न्यायालय':court;

    if (isRisk) {
      text = `"${c.title}" का जोखिम मूल्यांकन:\n\nजोखिम स्तर: ${riskHi}\n`;
      text += riskLevel==='High' ? '\nसिफारिश: तुरंत वकील से संपर्क करें। जमानत याचिका दायर करने पर विचार करें।' : riskLevel==='Medium' ? '\nसिफारिश: केस की प्रगति पर नज़र रखें और बचाव के दस्तावेज़ तैयार करें।' : '\nसिफारिश: सामान्य कानूनी प्रक्रिया लागू है।';
    } else if (isPetition) {
      text = `"${c.title}" की याचिका पात्रता:\n\nवर्तमान में याचिका पात्रता का मूल्यांकन उपलब्ध नहीं है। कृपया पहले AI विश्लेषण चलाएं।`;
    } else if (isIPC) {
      const ipcChunk = chunks.find(x => x.type === 'ipc_sections');
      text = `"${c.title}" में लागू कानूनी धाराएं:\n\n`;
      text += ipcChunk ? ipcChunk.content.replace('IPC Sections:','IPC धाराएं:') : 'कोई धारा पहचानी नहीं गई। FIR अपलोड करें।';
    } else {
      text = `"${c.title}" के बारे में जानकारी:\n\n`;
      text += `प्राथमिकी संख्या: ${c.firNumber}\n`;
      text += `न्यायालय: ${courtHi}\n`;
      text += `राज्य: ${state}\n`;
      text += `केस प्रकार: ${typeHi}\n`;
      text += `स्थिति: ${statusHi}\n`;
      text += `जोखिम स्तर: ${riskHi}\n\n`;
      text += `अधिक जानकारी के लिए जोखिम स्तर, याचिका पात्रता, या IPC धाराओं के बारे में पूछें।`;
    }
    suggestions = [`"${c.title}" का जोखिम स्तर क्या है?`, `"${c.title}" की याचिका पात्रता बताओ`, `"${c.title}" में कौन सी धाराएं लागू हैं?`];
  } else {
    // English
    if (isRisk) {
      text = `Risk assessment for "${c.title}":\n\nRisk Level: ${riskLevel||'Not assessed'}\n`;
      text += riskLevel==='High' ? '\nRecommendation: Seek immediate legal counsel. Consider bail application.' : riskLevel==='Medium' ? '\nRecommendation: Monitor case progress and prepare defense.' : '\nRecommendation: Standard procedures apply.';
    } else if (isPetition) {
      text = `Petition eligibility for "${c.title}":\n\nNot yet evaluated. Run AI analysis first.`;
    } else if (isIPC) {
      const ipcChunk = chunks.find(x => x.type === 'ipc_sections');
      text = `Legal sections for "${c.title}":\n\n`;
      text += ipcChunk ? ipcChunk.content : 'No sections identified. Upload FIR for extraction.';
    } else {
      text = `Case: "${c.title}" (FIR: ${c.firNumber})\n\nCourt: ${court}\nState: ${state}\nType: ${caseType}\nStatus: ${status}\nRisk: ${riskLevel||'N/A'}\n\nAsk about risk level, petition eligibility, or IPC sections.`;
    }
    suggestions = [`Risk level of ${c.title}?`, `Petition eligibility of ${c.title}?`, `IPC sections in ${c.title}?`];
  }

  return { message: text, suggestions, references: retrieval.cases.map(x=>({caseId:x.id,title:x.title})), confidence: ConfidenceCalculator.calculateChatConfidence(message,'retrieval'), timestamp: new Date() };
}

// ============================================================
// FALLBACK RESPONSE — native Hindi/English
// ============================================================
function generateFallback(message, lang) {
  const lowerMsg = message.toLowerCase();

  if (lang === 'hi') {
    if (/ipc|bns|धारा|section|420|302|376/i.test(lowerMsg)) {
      const sec = message.match(/(\d{1,3}[A-Z]?)/);
      const s = sec ? sec[1] : '';
      return { message: `IPC धारा ${s} भारतीय दंड संहिता का हिस्सा है। 1 जुलाई 2024 से भारतीय न्याय संहिता (BNS) ने IPC को प्रतिस्थापित किया है। अधिकांश धाराओं का पुनर्संख्यांकन हुआ है। सटीक BNS समकक्ष जानने के लिए "IPC बनाम BNS" टूल का उपयोग करें।`, suggestions: ['IPC 420 का BNS समकक्ष क्या है?', 'IPC 302 समझाओ', 'IPC और BNS में क्या अंतर है?'], references: [], confidence: 0.8, timestamp: new Date() };
    }
    if (/petition|याचिका|bail|जमानत|eligib|पात्र/i.test(lowerMsg)) {
      return { message: `याचिका पात्रता कई कारकों पर निर्भर करती है:\n\n1. अपराध की प्रकृति और गंभीरता\n2. सज़ा की अवधि\n3. फरार होने का खतरा\n4. आरोपी का चरित्र\n5. साक्ष्य की मजबूती\n\nविस्तृत AI मूल्यांकन के लिए अपने केस दस्तावेज़ अपलोड करें।`, suggestions: ['याचिका कैसे दायर करें?', 'जमानत के लिए क्या चाहिए?', 'केस अपलोड करें'], references: [], confidence: 0.8, timestamp: new Date() };
    }
    if (/case|केस|analys|विश्लेषण|fir|प्राथमिकी/i.test(lowerMsg)) {
      return { message: `मैं कानूनी केस का विश्लेषण कर सकता हूं। अपने दस्तावेज़ (FIR, चार्जशीट, न्यायालय आदेश) अपलोड करें और मैं प्रदान करूंगा:\n\n1. केस वर्गीकरण\n2. IPC से BNS मैपिंग\n3. जोखिम मूल्यांकन\n4. याचिका पात्रता\n5. समान केस\n6. कानूनी रणनीति\n\n"केस अपलोड करें" पर जाएं।`, suggestions: ['केस कैसे अपलोड करें?', 'कौन से दस्तावेज़ चाहिए?', 'विश्लेषण प्रक्रिया समझाओ'], references: [], confidence: 0.8, timestamp: new Date() };
    }
    return { message: `मैं आपका AI कानूनी सहायक हूं। मैं इनमें मदद कर सकता हूं:\n\n1. IPC से BNS धारा मैपिंग\n2. केस विश्लेषण और वर्गीकरण\n3. याचिका पात्रता मूल्यांकन\n4. कानूनी जोखिम मूल्यांकन\n5. समान केस खोज\n6. कानूनी रणनीति सुझाव\n\nकृपया कोई कानूनी प्रश्न पूछें या केस अपलोड करें।`, suggestions: ['IPC 420 क्या है?', 'केस विश्लेषण कैसे करें?', 'याचिका पात्रता जांचें'], references: [], confidence: 0.75, timestamp: new Date() };
  }

  // English fallback
  return aiFallback.generateAssistantResponse(message, {});
}

// ============================================================
// OTHER ENDPOINTS
// ============================================================
exports.getChatHistory = async (req, res, next) => { try { return ApiResponse.success(res, { history: [] }, 'OK'); } catch(e) { next(e); } };
exports.clearChatHistory = async (req, res, next) => { try { return ApiResponse.success(res, null, 'OK'); } catch(e) { next(e); } };
exports.getSuggestedPrompts = async (req, res, next) => { try { return ApiResponse.success(res, { suggestions: ['IPC 302 का BNS समकक्ष क्या है?','IPC 420 समझाओ','याचिका पात्रता कैसे जांचें?','जमानत के लिए क्या करें?','IPC और BNS में अंतर बताओ','केस विश्लेषण कैसे करें?'] }, 'OK'); } catch(e) { next(e); } };
exports.analyzeQuery = async (req, res, next) => { try { return ApiResponse.success(res, { analysis: { intent: 'info', entities: [], confidence: 0.85 } }, 'OK'); } catch(e) { next(e); } };
