const pdf = require('pdf-parse');
const fs = require('fs').promises;
const logger = require('./logger');

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<Object>} Extracted text and metadata
 */
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);

    return {
      text: data.text,
      pages: data.numpages,
      info: data.info,
      metadata: data.metadata,
      version: data.version
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

  // Extract date
  const dateMatch = text.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/);
  if (dateMatch) {
    metadata.dateOfIncident = dateMatch[1];
  }

  return metadata;
}

module.exports = {
  extractTextFromPDF,
  extractIPCSections,
  extractCaseMetadata
};
