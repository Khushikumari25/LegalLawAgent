/**
 * File System Helper Utilities
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class FileHelper {
  /**
   * Ensure directory exists
   */
  static async ensureDir(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * Check if file exists
   */
  static async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate unique filename from URL
   */
  static generateFilename(url, extension = 'pdf') {
    const hash = crypto.createHash('md5').update(url).digest('hex');
    return `${hash}.${extension}`;
  }

  /**
   * Sanitize filename
   */
  static sanitizeFilename(filename) {
    return filename
      .replace(/[^a-z0-9\s\-\_\.]/gi, '_')
      .replace(/\s+/g, '_')
      .substring(0, 200);
  }

  /**
   * Save text to file
   */
  static async saveTextFile(filePath, content) {
    await fs.writeFile(filePath, content, 'utf8');
  }

  /**
   * Save binary file
   */
  static async saveBinaryFile(filePath, buffer) {
    await fs.writeFile(filePath, buffer);
  }

  /**
   * Read JSON file
   */
  static async readJSON(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Write JSON file
   */
  static async writeJSON(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  /**
   * Get file size in MB
   */
  static async getFileSize(filePath) {
    const stats = await fs.stat(filePath);
    return (stats.size / (1024 * 1024)).toFixed(2);
  }
}

module.exports = FileHelper;
