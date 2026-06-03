/**
 * Indian Kanoon Crawler - Main Entry Point
 */

const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const logger = require('./logger');
const config = require('./config');
const FileHelper = require('./utils/fileHelper');
const PDFGenerator = require('./utils/pdfGenerator');
const JudgmentScraper = require('./scrapers/judgmentScraper');

class IndianKanoonCrawler {
  constructor() {
    this.scraper = new JudgmentScraper();
    this.downloadedUrls = new Set();
    this.metadata = [];
    this.stats = {
      totalProcessed: 0,
      supremeCourtCount: 0,
      highCourtCount: 0,
      pdfDownloaded: 0,
      pdfGenerated: 0,
      errors: 0
    };
  }

  /**
   * Initialize directories
   */
  async initialize() {
    logger.info('Initializing crawler...');
    
    await FileHelper.ensureDir(config.output.baseDir);
    await FileHelper.ensureDir(config.output.pdfsDir);
    await FileHelper.ensureDir(config.output.htmlDir);
    
    // Load existing metadata to avoid duplicates
    const existingMetadata = await FileHelper.readJSON(config.output.metadataFile);
    if (existingMetadata && Array.isArray(existingMetadata)) {
      existingMetadata.forEach(item => {
        if (item.sourceUrl) {
          this.downloadedUrls.add(item.sourceUrl);
        }
      });
      logger.info(`Loaded ${this.downloadedUrls.size} existing URLs to skip duplicates`);
    }

    logger.info('Initialization complete');
  }

  /**
   * Check if we've reached download limits
   */
  hasReachedLimits() {
    return (
      this.stats.supremeCourtCount >= config.limits.supremeCourtJudgments &&
      this.stats.highCourtCount >= config.limits.highCourtJudgments
    );
  }

  /**
   * Process a single judgment
   */
  async processJudgment(judgmentInfo) {
    try {
      // Skip if already downloaded
      if (this.downloadedUrls.has(judgmentInfo.url)) {
        logger.info(`Skipping duplicate: ${judgmentInfo.url}`);
        return null;
      }

      // Extract judgment details
      logger.info(`Processing: ${judgmentInfo.title}`);
      const details = await this.scraper.extractJudgmentDetails(judgmentInfo.url);

      // Check court type limits
      const isSupremeCourt = this.scraper.isSupremeCourt(details.court);
      const isHighCourt = this.scraper.isHighCourt(details.court);

      if (isSupremeCourt && this.stats.supremeCourtCount >= config.limits.supremeCourtJudgments) {
        logger.info(`Supreme Court limit reached, skipping: ${details.title}`);
        return null;
      }

      if (isHighCourt && this.stats.highCourtCount >= config.limits.highCourtJudgments) {
        logger.info(`High Court limit reached, skipping: ${details.title}`);
        return null;
      }

      // Generate filename
      const filename = FileHelper.sanitizeFilename(
        `${details.caseNumber}_${details.court}`.substring(0, 100)
      );
      const pdfFilename = `${filename}.pdf`;
      const pdfPath = path.join(config.output.pdfsDir, pdfFilename);

      // Download or generate PDF
      let pdfSource = 'generated';
      
      if (details.pdfUrl) {
        try {
          logger.info(`Downloading PDF from source...`);
          const pdfBuffer = await this.scraper.downloadPdf(details.pdfUrl, pdfPath);
          await FileHelper.saveBinaryFile(pdfPath, pdfBuffer);
          pdfSource = 'downloaded';
          this.stats.pdfDownloaded++;
          logger.info(`PDF downloaded: ${pdfFilename}`);
        } catch (error) {
          logger.warn(`PDF download failed, will generate from HTML: ${error.message}`);
        }
      }

      // Generate PDF if not downloaded
      if (pdfSource === 'generated') {
        try {
          if (details.html) {
            await PDFGenerator.htmlToPdf(details.html, pdfPath, details.title);
          } else {
            await PDFGenerator.textToPdf(details.text, pdfPath, details.title);
          }
          this.stats.pdfGenerated++;
          logger.info(`PDF generated: ${pdfFilename}`);
        } catch (error) {
          logger.error(`Failed to generate PDF: ${error.message}`);
          return null;
        }
      }

      // Save HTML for reference
      const htmlPath = path.join(config.output.htmlDir, `${filename}.html`);
      await FileHelper.saveTextFile(htmlPath, details.html || details.text);

      // Get file size
      const fileSize = await FileHelper.getFileSize(pdfPath);

      // Update stats
      this.stats.totalProcessed++;
      if (isSupremeCourt) this.stats.supremeCourtCount++;
      if (isHighCourt) this.stats.highCourtCount++;

      // Mark as downloaded
      this.downloadedUrls.add(judgmentInfo.url);

      // Create metadata entry
      const metadataEntry = {
        filename: pdfFilename,
        title: details.title,
        caseNumber: details.caseNumber,
        court: details.court,
        courtType: details.courtType,
        date: details.date,
        citation: details.citation,
        bench: details.bench,
        wordCount: details.wordCount,
        fileSizeMB: fileSize,
        pdfSource: pdfSource,
        sourceUrl: details.url,
        pdfUrl: details.pdfUrl || 'N/A',
        downloadedAt: new Date().toISOString(),
        htmlFile: `${filename}.html`
      };

      this.metadata.push(metadataEntry);

      logger.info(`✓ Processed successfully: ${details.title}`);
      logger.info(`Stats: SC=${this.stats.supremeCourtCount}/${config.limits.supremeCourtJudgments}, HC=${this.stats.highCourtCount}/${config.limits.highCourtJudgments}`);

      return metadataEntry;
    } catch (error) {
      logger.error(`Error processing judgment ${judgmentInfo.url}: ${error.message}`);
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Crawl a single search URL
   */
  async crawlSearchUrl(searchUrl) {
    try {
      logger.info(`\n========================================`);
      logger.info(`Crawling search URL: ${searchUrl}`);
      logger.info(`========================================\n`);

      // Extract judgment URLs from search results
      const judgmentUrls = await this.scraper.extractJudgmentUrls(searchUrl);

      if (judgmentUrls.length === 0) {
        logger.warn(`No judgments found for: ${searchUrl}`);
        return;
      }

      // Process each judgment
      for (const judgmentInfo of judgmentUrls) {
        // Check if limits reached
        if (this.hasReachedLimits()) {
          logger.info('Download limits reached for both Supreme Court and High Court');
          break;
        }

        await this.processJudgment(judgmentInfo);
      }
    } catch (error) {
      logger.error(`Error crawling search URL ${searchUrl}: ${error.message}`);
    }
  }

  /**
   * Save metadata to CSV
   */
  async saveMetadata() {
    try {
      logger.info('Saving metadata to CSV...');

      const csvWriter = createCsvWriter({
        path: config.output.metadataFile,
        header: [
          { id: 'filename', title: 'Filename' },
          { id: 'title', title: 'Case Title' },
          { id: 'caseNumber', title: 'Case Number' },
          { id: 'court', title: 'Court' },
          { id: 'courtType', title: 'Court Type' },
          { id: 'date', title: 'Date' },
          { id: 'citation', title: 'Citation' },
          { id: 'bench', title: 'Bench/Judge' },
          { id: 'wordCount', title: 'Word Count' },
          { id: 'fileSizeMB', title: 'File Size (MB)' },
          { id: 'pdfSource', title: 'PDF Source' },
          { id: 'sourceUrl', title: 'Source URL' },
          { id: 'pdfUrl', title: 'Original PDF URL' },
          { id: 'downloadedAt', title: 'Downloaded At' },
          { id: 'htmlFile', title: 'HTML File' }
        ]
      });

      await csvWriter.writeRecords(this.metadata);
      logger.info(`Metadata saved: ${config.output.metadataFile}`);
      logger.info(`Total records: ${this.metadata.length}`);
    } catch (error) {
      logger.error(`Error saving metadata: ${error.message}`);
    }
  }

  /**
   * Print final statistics
   */
  printStats() {
    logger.info('\n========================================');
    logger.info('CRAWLER STATISTICS');
    logger.info('========================================');
    logger.info(`Total Judgments Processed: ${this.stats.totalProcessed}`);
    logger.info(`Supreme Court Judgments: ${this.stats.supremeCourtCount}`);
    logger.info(`High Court Judgments: ${this.stats.highCourtCount}`);
    logger.info(`PDFs Downloaded: ${this.stats.pdfDownloaded}`);
    logger.info(`PDFs Generated: ${this.stats.pdfGenerated}`);
    logger.info(`Errors: ${this.stats.errors}`);
    logger.info(`Duplicates Skipped: ${this.downloadedUrls.size - this.stats.totalProcessed}`);
    logger.info('========================================\n');
  }

  /**
   * Run the crawler
   */
  async run() {
    try {
      logger.info('Starting Indian Kanoon Crawler...\n');

      // Initialize
      await this.initialize();

      // Crawl each search URL
      for (const searchUrl of config.searchUrls) {
        if (this.hasReachedLimits()) {
          logger.info('Download limits reached, stopping crawler');
          break;
        }

        await this.crawlSearchUrl(searchUrl);
      }

      // Save metadata
      await this.saveMetadata();

      // Print statistics
      this.printStats();

      logger.info('Crawler completed successfully!');
    } catch (error) {
      logger.error(`Fatal error: ${error.message}`);
      throw error;
    }
  }
}

// Run the crawler if this file is executed directly
if (require.main === module) {
  const crawler = new IndianKanoonCrawler();
  
  crawler.run()
    .then(() => {
      logger.info('Process completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error(`Process failed: ${error.message}`);
      process.exit(1);
    });
}

module.exports = IndianKanoonCrawler;
