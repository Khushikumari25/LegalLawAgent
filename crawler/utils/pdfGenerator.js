/**
 * PDF Generator from HTML/Text Content
 */

const puppeteer = require('puppeteer');
const logger = require('../logger');

class PDFGenerator {
  /**
   * Convert HTML content to PDF using Puppeteer
   */
  static async htmlToPdf(htmlContent, outputPath, title = 'Legal Judgment') {
    let browser = null;
    try {
      logger.info(`Generating PDF from HTML: ${title}`);

      // Launch headless browser
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();

      // Create styled HTML document
      const styledHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            body {
              font-family: 'Times New Roman', Times, serif;
              font-size: 11pt;
              line-height: 1.6;
              color: #000;
              margin: 0;
              padding: 20px;
            }
            h1, h2, h3 {
              font-weight: bold;
              margin-top: 20px;
              margin-bottom: 10px;
            }
            h1 { font-size: 18pt; text-align: center; }
            h2 { font-size: 14pt; }
            h3 { font-size: 12pt; }
            p {
              margin: 10px 0;
              text-align: justify;
            }
            .judgment-header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .section {
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 10px;
              border-top: 1px solid #ccc;
              font-size: 9pt;
              color: #666;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `;

      // Set content and generate PDF
      await page.setContent(styledHtml, {
        waitUntil: 'networkidle0'
      });

      await page.pdf({
        path: outputPath,
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        printBackground: true
      });

      logger.info(`PDF generated successfully: ${outputPath}`);
      return true;
    } catch (error) {
      logger.error(`Error generating PDF: ${error.message}`);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Convert plain text to PDF
   */
  static async textToPdf(textContent, outputPath, title = 'Legal Judgment') {
    // Escape HTML and preserve line breaks
    const escapedText = textContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');

    const htmlContent = `
      <div class="judgment-header">
        <h1>${title}</h1>
      </div>
      <div class="section">
        <p>${escapedText}</p>
      </div>
    `;

    return await this.htmlToPdf(htmlContent, outputPath, title);
  }
}

module.exports = PDFGenerator;
