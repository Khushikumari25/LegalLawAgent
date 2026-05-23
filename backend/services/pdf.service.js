/**
 * PDF Report Generation Service
 * Generates real downloadable PDF legal reports using PDFKit
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Ensure reports directory exists
const REPORTS_DIR = path.join(__dirname, '../../reports-output');
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Hindi font path
const HINDI_FONT = path.join(__dirname, '../assets/NotoSansDevanagari.ttf');
const hasHindiFont = fs.existsSync(HINDI_FONT);

class PDFService {
  generatePDF(reportData, reportId) {
    return new Promise((resolve, reject) => {
      try {
        const filename = `report-${reportId}.pdf`;
        const filepath = path.join(REPORTS_DIR, filename);
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Register Hindi font if available
        if (hasHindiFont) {
          doc.registerFont('Hindi', HINDI_FONT);
        }

        // Detect if content has Hindi characters
        const contentStr = JSON.stringify(reportData);
        const hasHindi = /[\u0900-\u097F]/.test(contentStr);
        const fontName = (hasHindi && hasHindiFont) ? 'Hindi' : 'Helvetica';

        // Header
        if (hasHindi && hasHindiFont) {
          doc.font('Hindi').fontSize(12).fillColor('#c99846').text('न्यायASTRA AI', { align: 'center' });
        } else {
          doc.fontSize(11).fillColor('#c99846').text('NyayASTRA AI', { align: 'center' });
        }
        doc.font(fontName).fontSize(8).fillColor('#8b5a2b').text('Enterprise Legal Intelligence', { align: 'center' });
        doc.moveDown(1);

        // Title
        const title = reportData.title || 'Legal Intelligence Report';
        doc.font(fontName).fontSize(16).fillColor('#3b2416').text(title, { align: 'center' });
        doc.moveDown(0.5);
        doc.font(fontName).fontSize(9).fillColor('#666').text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, { align: 'center' });
        doc.moveDown(1.5);
        this._drawDivider(doc);
        doc.moveDown(1);

        // Sections
        const sections = reportData.sections || [];
        for (const section of sections) {
          if (!section.title || !section.content) continue;
          doc.font(fontName).fontSize(13).fillColor('#5c3a1e').text(section.title);
          doc.moveDown(0.4);
          const content = typeof section.content === 'string' ? section.content : JSON.stringify(section.content, null, 2);
          doc.font(fontName).fontSize(10).fillColor('#333').text(content, { lineGap: 3 });
          doc.moveDown(1);
          this._drawDivider(doc);
          doc.moveDown(0.8);
        }

        // Footer
        doc.moveDown(2);
        if (hasHindi && hasHindiFont) {
          doc.font('Hindi').fontSize(8).fillColor('#8b5a2b').text('न्यायASTRA AI — For the People', { align: 'center' });
        } else {
          doc.font('Helvetica').fontSize(8).fillColor('#8b5a2b').text('NyayASTRA AI — For the People', { align: 'center' });
        }

        doc.end();
        stream.on('finish', () => { resolve({ filepath, filename, size: fs.statSync(filepath).size }); });
        stream.on('error', (err) => { reject(err); });
      } catch (error) {
        logger.error(`PDF generation error: ${error.message}`);
        reject(error);
      }
    });
  }

  _drawDivider(doc) {
    doc.strokeColor('#e0c49e').lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  }
}

module.exports = new PDFService();
