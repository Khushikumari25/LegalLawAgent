/**
 * Indian Kanoon Crawler Configuration
 */

module.exports = {
  // Target URLs to crawl
  searchUrls: [
    'https://indiankanoon.org/search/?formInput=section%20302%20ipc',
    'https://indiankanoon.org/search/?formInput=section%20304B%20ipc',
    'https://indiankanoon.org/search/?formInput=section%20498A%20ipc',
    'https://indiankanoon.org/search/?formInput=pocso'
  ],

  // Download limits
  limits: {
    highCourtJudgments: 10,
    supremeCourtJudgments: 10,
    maxPagesPerSearch: 5 // Maximum search result pages to crawl
  },

  // Output directories
  output: {
    baseDir: './downloads',
    pdfsDir: './downloads/pdfs',
    htmlDir: './downloads/html',
    metadataFile: './downloads/metadata.csv'
  },

  // Crawler settings
  crawler: {
    delayBetweenRequests: 2000, // 2 seconds delay to be respectful
    timeout: 30000, // 30 seconds timeout
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    retryAttempts: 3,
    retryDelay: 5000
  },

  // Court identifiers
  courts: {
    supremeCourt: ['Supreme Court', 'SC of India', 'Supreme Court of India'],
    highCourt: ['High Court', 'HC']
  },

  // PDF generation settings
  pdf: {
    pageSize: 'A4',
    margins: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50
    },
    fontSize: 11,
    lineHeight: 1.5
  }
};
