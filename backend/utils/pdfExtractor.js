const pdf = require('pdf-parse');
const fs = require('fs').promises;
const logger = require('./logger');

/**
 * Extract text from PDF file with optimized memory handling for large files
 * @param {string} filePath - Path to PDF file
 * @param {Object} options - Extraction options
 * @returns {Promise<Object>} Extracted text and metadata
 */
async function extractTextFromPDF(filePath, options = {}) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    
    // For very large PDFs, extract only first N pages for metadata
    const maxPagesForMetadata = options.maxPages || 50; // Only process first 50 pages for metadata extraction
    
    const pdfOptions = {
      max: maxPagesForMetadata, // Limit pages processed for metadata
      version: 'v2.0.550' // Use specific version for consistency
    };
    
    const data = await pdf(dataBuffer, pdfOptions);
    
    // For large PDFs, only keep first 100KB of text to avoid memory issues
    const maxTextLength = options.maxTextLength || 500000; // ~500KB of text (~100 pages avg)
    const truncatedText = data.text.length > maxTextLength 
      ? data.text.substring(0, maxTextLength) + '\n\n[... PDF truncated for processing. Full document stored.]'
      : data.text;

    logger.info(`PDF extracted: ${data.numpages} pages, ${data.text.length} chars, stored ${truncatedText.length} chars`);

    return {
      text: truncatedText,
      fullTextLength: data.text.length,
      pages: data.numpages,
      info: data.info,
      metadata: data.metadata,
      version: data.version,
      truncated: data.text.length > maxTextLength
    };
  } catch (error) {
    logger.error(`PDF extraction error: ${error.message}`);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extract IPC sections from text
 * @param {string} text - Text content
 * @returns {Array} Array of IPC sections found
 */
function extractIPCSections(text) {
  const ipcPattern = /(?:Section\s+)?(\d{1,3}[A-Z]?)\s+(?:of\s+)?(?:IPC|Indian Penal Code)/gi;
  const matches = [];
  const seen = new Set();

  let match;
  while ((match = ipcPattern.exec(text)) !== null) {
    const section = match[1].toUpperCase();
    if (!seen.has(section)) {
      seen.add(section);
      matches.push({
        section: section,
        context: text.substring(Math.max(0, match.index - 50), Math.min(text.length, match.index + 100))
      });
    }
  }

  return matches;
}

/**
 * Validate if a date is valid
 * @param {number} day - Day (1-31)
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {boolean} True if valid date
 */
function isValidDate(day, month, year) {
  // Validate ranges
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1947 || year > 2030) return false; // Reasonable range for Indian legal cases
  
  // Days in each month (non-leap year)
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // Check for leap year
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  if (isLeapYear && month === 2) {
    return day <= 29;
  }
  
  return day <= daysInMonth[month - 1];
}

/**
 * Parse and validate date, converting to YYYY-MM-DD format
 * @param {string} dateStr - Date string in various formats
 * @returns {string|null} Date in YYYY-MM-DD format or null if invalid
 */
function parseAndValidateDate(dateStr) {
  if (!dateStr) return null;
  
  // Month name mapping for Indian English dates
  const monthNames = {
    'january': 1, 'jan': 1,
    'february': 2, 'feb': 2,
    'march': 3, 'mar': 3,
    'april': 4, 'apr': 4,
    'may': 5,
    'june': 6, 'jun': 6,
    'july': 7, 'jul': 7,
    'august': 8, 'aug': 8,
    'september': 9, 'sep': 9, 'sept': 9,
    'october': 10, 'oct': 10,
    'november': 11, 'nov': 11,
    'december': 12, 'dec': 12
  };
  
  let day, month, year;
  
  // Pattern 1: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const numericPattern = /^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})$/;
  const numericMatch = dateStr.match(numericPattern);
  
  if (numericMatch) {
    day = parseInt(numericMatch[1], 10);
    month = parseInt(numericMatch[2], 10);
    year = parseInt(numericMatch[3], 10);
    
    // Convert 2-digit year to 4-digit
    if (year < 100) {
      year = year < 50 ? 2000 + year : 1900 + year;
    }
    
    // Validate the date
    if (isValidDate(day, month, year)) {
      // Convert to YYYY-MM-DD format
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    return null; // Invalid date
  }
  
  // Pattern 2: "28 April 2008" or "28th April 2008" or "28 Apr 2008"
  const textPattern = /^(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})$/;
  const textMatch = dateStr.match(textPattern);
  
  if (textMatch) {
    day = parseInt(textMatch[1], 10);
    const monthStr = textMatch[2].toLowerCase();
    month = monthNames[monthStr];
    year = parseInt(textMatch[3], 10);
    
    if (month && isValidDate(day, month, year)) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    return null;
  }
  
  // Pattern 3: "April 28, 2008"
  const usPattern = /^([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/;
  const usMatch = dateStr.match(usPattern);
  
  if (usMatch) {
    const monthStr = usMatch[1].toLowerCase();
    month = monthNames[monthStr];
    day = parseInt(usMatch[2], 10);
    year = parseInt(usMatch[3], 10);
    
    if (month && isValidDate(day, month, year)) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    return null;
  }
  
  // If no pattern matches or date is invalid, return null
  return null;
}

/**
 * Extract case metadata from text
 * @param {string} text - Text content
 * @returns {Object} Extracted metadata
 */
function extractCaseMetadata(text) {
  const metadata = {
    firNumber: null,
    policeStation: null,
    dateOfIncident: null,
    accused: [],
    victims: []
  };

  // Extract FIR number
  const firMatch = text.match(/FIR\s+(?:No\.?|Number)\s*:?\s*(\d+\/\d+)/i);
  if (firMatch) {
    metadata.firNumber = firMatch[1];
  }

  // Extract police station
  const psMatch = text.match(/Police\s+Station\s*:?\s*([A-Za-z\s]+)/i);
  if (psMatch) {
    metadata.policeStation = psMatch[1].trim();
  }

  // Extract date - try multiple patterns
  const datePatterns = [
    // Numeric formats: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
    /(?:Date(?:\s+of\s+Incident)?|Incident(?:\s+Date)?|On)\s*:?\s*(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4})/i,
    // Text formats: "28 April 2008", "28th April 2008"
    /(?:Date(?:\s+of\s+Incident)?|Incident(?:\s+Date)?|On)\s*:?\s*(\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+\d{4})/i,
    // US format: "April 28, 2008"
    /(?:Date(?:\s+of\s+Incident)?|Incident(?:\s+Date)?|On)\s*:?\s*([A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})/i,
    // Standalone numeric date (fallback)
    /(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4})/
  ];
  
  for (const pattern of datePatterns) {
    const dateMatch = text.match(pattern);
    if (dateMatch) {
      const parsedDate = parseAndValidateDate(dateMatch[1]);
      if (parsedDate) {
        metadata.dateOfIncident = parsedDate;
        break; // Use first valid date found
      }
    }
  }

  return metadata;
}

module.exports = {
  extractTextFromPDF,
  extractIPCSections,
  extractCaseMetadata
};
