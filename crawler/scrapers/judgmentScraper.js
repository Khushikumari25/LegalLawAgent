/**
 * Indian Kanoon Judgment Scraper
 */

const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../logger');
const config = require('../config');

class JudgmentScraper {
  constructor() {
    this.axiosInstance = axios.create({
      timeout: config.crawler.timeout,
      headers: {
        'User-Agent': config.crawler.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive'
      }
    });
  }

  /**
   * Delay execution
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Fetch page with retries
   */
  async fetchPage(url, retries = config.crawler.retryAttempts) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        logger.info(`Fetching: ${url} (Attempt ${attempt}/${retries})`);
        const response = await this.axiosInstance.get(url);
        await this.delay(config.crawler.delayBetweenRequests);
        return response.data;
      } catch (error) {
        logger.warn(`Failed to fetch ${url}: ${error.message}`);
        if (attempt === retries) {
          throw new Error(`Failed after ${retries} attempts: ${error.message}`);
        }
        await this.delay(config.crawler.retryDelay);
      }
    }
  }

  /**
   * Extract judgment URLs from search results page
   */
  async extractJudgmentUrls(searchUrl) {
    try {
      const html = await this.fetchPage(searchUrl);
      const $ = cheerio.load(html);
      const judgmentUrls = [];

      // Indian Kanoon search results are in div.result
      $('.result').each((index, element) => {
        const link = $(element).find('a').first();
        const href = link.attr('href');
        
        if (href && href.startsWith('/doc/')) {
          const fullUrl = `https://indiankanoon.org${href}`;
          const title = link.text().trim();
          
          judgmentUrls.push({
            url: fullUrl,
            title: title || 'Untitled Judgment',
            snippet: $(element).find('.result_snippet').text().trim()
          });
        }
      });

      logger.info(`Extracted ${judgmentUrls.length} judgment URLs from ${searchUrl}`);
      return judgmentUrls;
    } catch (error) {
      logger.error(`Error extracting judgment URLs from ${searchUrl}: ${error.message}`);
      return [];
    }
  }

  /**
   * Extract judgment details from judgment page
   */
  async extractJudgmentDetails(judgmentUrl) {
    try {
      const html = await this.fetchPage(judgmentUrl);
      const $ = cheerio.load(html);

      // Extract metadata
      const title = $('h2.doc_title').first().text().trim() || 
                    $('title').text().trim() || 
                    'Untitled Judgment';

      // Extract court information
      const breadcrumbs = $('.breadcrumbs').text();
      let court = 'Unknown Court';
      let courtType = 'Other';

      if (breadcrumbs.includes('Supreme Court')) {
        court = 'Supreme Court of India';
        courtType = 'Supreme Court';
      } else if (breadcrumbs.includes('High Court')) {
        const courtMatch = breadcrumbs.match(/([A-Za-z\s]+High Court)/);
        court = courtMatch ? courtMatch[1].trim() : 'High Court';
        courtType = 'High Court';
      }

      // Extract judgment text
      const judgmentDiv = $('.judgments').first();
      const judgmentText = judgmentDiv.text().trim();
      const judgmentHtml = judgmentDiv.html() || '';

      // Extract date
      let date = 'Unknown Date';
      const dateMatch = judgmentText.match(/(\d{1,2}[\s\-\/]\w+[\s\-\/]\d{4})/);
      if (dateMatch) {
        date = dateMatch[1];
      }

      // Extract case number
      let caseNumber = 'Unknown';
      const caseNumMatch = title.match(/(Criminal Appeal|Civil Appeal|Writ Petition|Special Leave Petition)[\s\w]*No[.\s]*(\d+[\w\s\/\-]*\d+)/i);
      if (caseNumMatch) {
        caseNumber = caseNumMatch[0];
      }

      // Check for PDF download link
      let pdfUrl = null;
      $('a').each((i, elem) => {
        const href = $(elem).attr('href');
        if (href && (href.includes('.pdf') || href.includes('pdf'))) {
          pdfUrl = href.startsWith('http') ? href : `https://indiankanoon.org${href}`;
        }
      });

      // Extract citation
      const citation = $('.citation').first().text().trim();

      // Extract author/bench
      let bench = 'Unknown';
      const benchMatch = judgmentText.match(/(?:CORAM|Bench|Before)[:\s]+(.+?)(?:\n|JUDGMENT)/i);
      if (benchMatch) {
        bench = benchMatch[1].trim().substring(0, 200);
      }

      return {
        url: judgmentUrl,
        title,
        court,
        courtType,
        date,
        caseNumber,
        citation,
        bench,
        text: judgmentText,
        html: judgmentHtml,
        pdfUrl,
        wordCount: judgmentText.split(/\s+/).length
      };
    } catch (error) {
      logger.error(`Error extracting judgment details from ${judgmentUrl}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Download PDF from URL
   */
  async downloadPdf(pdfUrl, outputPath) {
    try {
      logger.info(`Downloading PDF from: ${pdfUrl}`);
      
      const response = await this.axiosInstance.get(pdfUrl, {
        responseType: 'arraybuffer'
      });

      await this.delay(config.crawler.delayBetweenRequests);
      return response.data;
    } catch (error) {
      logger.error(`Error downloading PDF from ${pdfUrl}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if URL is a Supreme Court judgment
   */
  isSupremeCourt(court) {
    return config.courts.supremeCourt.some(sc => 
      court.toLowerCase().includes(sc.toLowerCase())
    );
  }

  /**
   * Check if URL is a High Court judgment
   */
  isHighCourt(court) {
    return config.courts.highCourt.some(hc => 
      court.toLowerCase().includes(hc.toLowerCase())
    );
  }
}

module.exports = JudgmentScraper;
