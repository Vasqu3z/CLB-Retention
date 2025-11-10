/**
 * @file logger.js
 * @description Standardized logging utility for CLB League Hub Discord Bot
 *
 * Purpose:
 * - Provide consistent logging format across the application (P4: Professional & Structural)
 * - Include timestamps, log levels, and context for easier debugging
 * - Support different log levels (INFO, WARN, ERROR, DEBUG)
 *
 * Key Responsibilities:
 * - Format log messages with timestamp and level
 * - Support contextual logging (e.g., [SheetsService], [Command:rankings])
 * - Enable/disable debug logging via environment variable
 *
 * Usage:
 * ```
 * import logger from './utils/logger.js';
 * logger.info('SheetsService', 'Cache refreshed successfully');
 * logger.error('Command:rankings', 'Failed to fetch leaders', error);
 * ```
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

class Logger {
  constructor() {
    this.level = process.env.LOG_LEVEL === 'DEBUG' ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;
  }

  /**
   * Format timestamp for log messages
   * @returns {string} Formatted timestamp (YYYY-MM-DD HH:MM:SS)
   */
  getTimestamp() {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substring(0, 19);
  }

  /**
   * Internal log method that formats and outputs messages
   * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR)
   * @param {string} context - Context/location (e.g., 'SheetsService', 'Command:rankings')
   * @param {string} message - Log message
   * @param {*} data - Optional additional data to log
   */
  log(level, context, message, data = null) {
    const levelValue = LOG_LEVELS[level];
    if (levelValue < this.level) {
      return; // Skip logs below current level
    }

    const timestamp = this.getTimestamp();
    const formattedMessage = `[${timestamp}] [${level}] [${context}] ${message}`;

    if (level === 'ERROR') {
      console.error(formattedMessage, data || '');
    } else if (level === 'WARN') {
      console.warn(formattedMessage, data || '');
    } else {
      console.log(formattedMessage, data || '');
    }
  }

  /**
   * Log debug message (only shown when LOG_LEVEL=DEBUG)
   * @param {string} context - Context/location
   * @param {string} message - Log message
   * @param {*} data - Optional data to log
   */
  debug(context, message, data = null) {
    this.log('DEBUG', context, message, data);
  }

  /**
   * Log informational message
   * @param {string} context - Context/location
   * @param {string} message - Log message
   * @param {*} data - Optional data to log
   */
  info(context, message, data = null) {
    this.log('INFO', context, message, data);
  }

  /**
   * Log warning message
   * @param {string} context - Context/location
   * @param {string} message - Log message
   * @param {*} data - Optional data to log
   */
  warn(context, message, data = null) {
    this.log('WARN', context, message, data);
  }

  /**
   * Log error message
   * @param {string} context - Context/location
   * @param {string} message - Log message
   * @param {Error|*} error - Error object or additional data
   */
  error(context, message, error = null) {
    this.log('ERROR', context, message, error);
  }
}

// Export singleton instance
const logger = new Logger();
export default logger;
