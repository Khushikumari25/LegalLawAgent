/**
 * Multilingual Translation System
 * Supports: English (en), Hindi (hi), Hinglish (hinglish)
 */

const TRANSLATIONS = {
  en: {
    // Sidebar
    overview: 'Overview',
    uploadCase: 'Upload Case',
    myCases: 'My Cases',
    ipcVsBns: 'IPC vs BNS',
    aiAssistant: 'AI Assistant',
    reports: 'Reports',
    aiModels: 'AI Models',
    signOut: 'Sign Out',
    // Header
    overviewSubtitle: 'AI-powered legal intelligence at a glance',
    uploadSubtitle: 'Add a new case for analysis',
    casesSubtitle: 'Manage and analyze your cases',
    ipcSubtitle: 'Indian Penal Code to BNS mapping',
    assistantSubtitle: 'Ask legal questions',
    reportsSubtitle: 'Generate and view reports',
    modelsSubtitle: 'Manage AI providers and models',
    // Stats
    totalCases: 'Total Cases',
    aiAnalyzed: 'AI Analyzed',
    pending: 'Pending',
    eligiblePetitions: 'Eligible Petitions',
    // Upload
    uploadTitle: 'Upload New Case',
    caseTitle: 'Case Title',
    firNumber: 'FIR Number',
    policeStation: 'Police Station',
    state: 'State',
    court: 'Court',
    caseType: 'Case Type',
    documents: 'Documents',
    uploadBtn: 'Upload Case',
    uploading: 'Uploading...',
    // Cases
    allCases: 'All Cases',
    newCase: '+ New',
    analyze: 'Analyze',
    results: 'Results',
    analysisResults: 'Analysis Results',
    // IPC BNS
    ipcTitle: 'IPC to BNS Mapping',
    ipcSubtitleText: 'Find the Bharatiya Nyaya Sanhita equivalent of any IPC section',
    searchBtn: 'Search',
    downloadPdf: 'Download Comparison PDF',
    // Assistant
    assistantTitle: 'AI Legal Assistant',
    assistantDesc: 'Multi-agent intelligence',
    chatPlaceholder: 'Ask a legal question or upload a document...',
    sendBtn: 'Send',
    chatWelcome: 'Hello. I am your AI legal assistant. Ask me about IPC sections, BNS equivalents, petition eligibility, or upload a PDF for analysis.',
    // Reports
    generateReport: 'Generate Report',
    reportTitle: 'Title',
    reportType: 'Type',
    generateBtn: 'Generate',
    myReports: 'My Reports',
    // Models
    modelsTitle: 'AI Models & Providers',
    activeModel: 'Currently Active',
    activeAgents: 'Active Agents',
    // Common
    loading: 'Loading...',
    noData: 'No data available.',
    error: 'An error occurred.',
    success: 'Success',
    language: 'Language'
  },

  hi: {
    overview: 'अवलोकन',
    uploadCase: 'केस अपलोड करें',
    myCases: 'मेरे केस',
    ipcVsBns: 'IPC बनाम BNS',
    aiAssistant: 'AI सहायक',
    reports: 'रिपोर्ट्स',
    aiModels: 'AI मॉडल',
    signOut: 'लॉग आउट',
    overviewSubtitle: 'AI-संचालित कानूनी बुद्धिमत्ता',
    uploadSubtitle: 'विश्लेषण के लिए नया केस जोड़ें',
    casesSubtitle: 'अपने केस प्रबंधित करें',
    ipcSubtitle: 'भारतीय दंड संहिता से BNS मैपिंग',
    assistantSubtitle: 'कानूनी प्रश्न पूछें',
    reportsSubtitle: 'रिपोर्ट बनाएं और देखें',
    modelsSubtitle: 'AI प्रदाता और मॉडल प्रबंधित करें',
    totalCases: 'कुल केस',
    aiAnalyzed: 'AI विश्लेषित',
    pending: 'लंबित',
    eligiblePetitions: 'पात्र याचिकाएं',
    uploadTitle: 'नया केस अपलोड करें',
    caseTitle: 'केस शीर्षक',
    firNumber: 'FIR नंबर',
    policeStation: 'थाना',
    state: 'राज्य',
    court: 'न्यायालय',
    caseType: 'केस प्रकार',
    documents: 'दस्तावेज़',
    uploadBtn: 'केस अपलोड करें',
    uploading: 'अपलोड हो रहा है...',
    allCases: 'सभी केस',
    newCase: '+ नया',
    analyze: 'विश्लेषण',
    results: 'परिणाम',
    analysisResults: 'विश्लेषण परिणाम',
    ipcTitle: 'IPC से BNS मैपिंग',
    ipcSubtitleText: 'किसी भी IPC धारा का भारतीय न्याय संहिता समकक्ष खोजें',
    searchBtn: 'खोजें',
    downloadPdf: 'तुलना PDF डाउनलोड करें',
    assistantTitle: 'AI कानूनी सहायक',
    assistantDesc: 'मल्टी-एजेंट बुद्धिमत्ता',
    chatPlaceholder: 'कानूनी प्रश्न पूछें या दस्तावेज़ अपलोड करें...',
    sendBtn: 'भेजें',
    chatWelcome: 'नमस्ते। मैं आपका AI कानूनी सहायक हूं। IPC धाराओं, BNS समकक्षों, याचिका पात्रता, या किसी भी कानूनी प्रश्न के बारे में पूछें।',
    generateReport: 'रिपोर्ट बनाएं',
    reportTitle: 'शीर्षक',
    reportType: 'प्रकार',
    generateBtn: 'बनाएं',
    myReports: 'मेरी रिपोर्ट्स',
    modelsTitle: 'AI मॉडल और प्रदाता',
    activeModel: 'वर्तमान सक्रिय',
    activeAgents: 'सक्रिय एजेंट',
    loading: 'लोड हो रहा है...',
    noData: 'कोई डेटा उपलब्ध नहीं।',
    error: 'एक त्रुटि हुई।',
    success: 'सफल',
    language: 'भाषा'
  },

  hinglish: {
    overview: 'Overview',
    uploadCase: 'Case Upload Karo',
    myCases: 'Mere Cases',
    ipcVsBns: 'IPC vs BNS',
    aiAssistant: 'AI Assistant',
    reports: 'Reports',
    aiModels: 'AI Models',
    signOut: 'Log Out',
    overviewSubtitle: 'AI-powered legal intelligence ek nazar mein',
    uploadSubtitle: 'Analysis ke liye naya case add karo',
    casesSubtitle: 'Apne cases manage aur analyze karo',
    ipcSubtitle: 'Indian Penal Code se BNS mapping',
    assistantSubtitle: 'Legal questions pucho',
    reportsSubtitle: 'Reports generate aur dekho',
    modelsSubtitle: 'AI providers aur models manage karo',
    totalCases: 'Total Cases',
    aiAnalyzed: 'AI Analyzed',
    pending: 'Pending',
    eligiblePetitions: 'Eligible Petitions',
    uploadTitle: 'Naya Case Upload Karo',
    caseTitle: 'Case Title',
    firNumber: 'FIR Number',
    policeStation: 'Thana',
    state: 'State',
    court: 'Court',
    caseType: 'Case Type',
    documents: 'Documents',
    uploadBtn: 'Case Upload Karo',
    uploading: 'Upload ho raha hai...',
    allCases: 'Saare Cases',
    newCase: '+ Naya',
    analyze: 'Analyze Karo',
    results: 'Results',
    analysisResults: 'Analysis Results',
    ipcTitle: 'IPC se BNS Mapping',
    ipcSubtitleText: 'Kisi bhi IPC section ka BNS equivalent dhoondho',
    searchBtn: 'Search',
    downloadPdf: 'Comparison PDF Download',
    assistantTitle: 'AI Legal Assistant',
    assistantDesc: 'Multi-agent intelligence',
    chatPlaceholder: 'Legal question pucho ya document upload karo...',
    sendBtn: 'Bhejo',
    chatWelcome: 'Hello! Main aapka AI legal assistant hoon. IPC sections, BNS equivalents, petition eligibility, ya koi bhi legal query pucho.',
    generateReport: 'Report Generate Karo',
    reportTitle: 'Title',
    reportType: 'Type',
    generateBtn: 'Generate',
    myReports: 'Meri Reports',
    modelsTitle: 'AI Models & Providers',
    activeModel: 'Currently Active',
    activeAgents: 'Active Agents',
    loading: 'Load ho raha hai...',
    noData: 'Koi data available nahi.',
    error: 'Ek error aa gaya.',
    success: 'Ho gaya!',
    language: 'Bhasha'
  }
};

// Language Manager
const LangManager = {
  current: localStorage.getItem('appLanguage') || 'en',

  set(lang) {
    this.current = lang;
    localStorage.setItem('appLanguage', lang);
    this.applyTranslations();
  },

  t(key) {
    return TRANSLATIONS[this.current]?.[key] || TRANSLATIONS.en[key] || key;
  },

  applyTranslations() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = this.t(key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = text;
      } else if (el.tagName === 'BUTTON' && el.querySelector('[data-i18n]') === null) {
        el.textContent = text;
      } else {
        el.textContent = text;
      }
    });
    // Handle placeholder translations
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const keys = key.split('.');
        let value = TRANSLATIONS[this.current];
        for (const k of keys) {
            if (value) value = value[k];
        }
        if (value) el.setAttribute('placeholder', value);
    });

    // Handle title/tooltip translations
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        const keys = key.split('.');
        let value = TRANSLATIONS[this.current];
        for (const k of keys) {
            if (value) value = value[k];
        }
        if (value) el.setAttribute('title', value);
    });

    // Update language selector display
    const langDisplay = document.getElementById('langDisplay');
    if (langDisplay) {
      const labels = { en: 'EN', hi: 'हि', hinglish: 'Hi-En' };
      langDisplay.textContent = labels[this.current] || 'EN';
    }
    // Re-apply page title if navigateTo was called
    const pageTitle = document.getElementById('pageTitle');
    const pageSub = document.getElementById('pageSubtitle');
    if (pageTitle && pageTitle.getAttribute('data-i18n')) {
      pageTitle.textContent = this.t(pageTitle.getAttribute('data-i18n'));
    }
    if (pageSub && pageSub.getAttribute('data-i18n')) {
      pageSub.textContent = this.t(pageSub.getAttribute('data-i18n'));
    }
  },

  getLangForAPI() {
    return this.current;
  }
};
