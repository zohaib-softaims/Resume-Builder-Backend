import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define custom log levels with colors
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
  },
};

// Add colors to Winston
winston.addColors(customLevels.colors);

// Define format for console output (colorized)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(
    (info) => {
      const { timestamp, level, message, ...args } = info;
      const ts = timestamp.slice(0, 19).replace('T', ' ');
      return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
    }
  )
);

// Define format for file output (non-colorized, structured JSON)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => {
      const { timestamp, level, message, ...args } = info;
      return `${timestamp} [${level.toUpperCase()}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
    }
  )
);

// Create logger instance - ONLY logs to console
const logger = winston.createLogger({
  levels: customLevels.levels,
  transports: [
    // Console transport - logs to console only
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.LOG_LEVEL || 'debug',
    }),
  ],
});

// Create dedicated file logger for logger.file()
const fileLogger = winston.createLogger({
  levels: customLevels.levels,
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/app.log'),
      format: fileFormat,
      level: 'debug',
    }),
  ],
});

/**
 * Custom logger methods for better usability
 * Supports logging objects and any data structures
 */
const loggerWithHelpers = {
  /**
   * Log info level messages
   * @param {string} message - Log message
   * @param {any} data - Additional data (object, error, etc.)
   */
  info: (message, data = {}) => {
    if (typeof data === 'object') {
      logger.log('info', message, data);
    } else {
      logger.log('info', message, { data });
    }
  },

  /**
   * Log error level messages
   * @param {string} message - Log message
   * @param {Error|object} error - Error object or additional data
   */
  error: (message, error = {}) => {
    const errorData = error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : error;
    logger.log('error', message, errorData);
  },

  /**
   * Log warn level messages
   * @param {string} message - Log message
   * @param {any} data - Additional data
   */
  warn: (message, data = {}) => {
    if (typeof data === 'object') {
      logger.log('warn', message, data);
    } else {
      logger.log('warn', message, { data });
    }
  },

  /**
   * Log debug level messages
   * @param {string} message - Log message
   * @param {any} data - Additional data
   */
  debug: (message, data = {}) => {
    if (typeof data === 'object') {
      logger.log('debug', message, data);
    } else {
      logger.log('debug', message, { data });
    }
  },

  /**
   * Log http level messages
   * @param {string} message - Log message
   * @param {any} data - Additional data
   */
  http: (message, data = {}) => {
    if (typeof data === 'object') {
      logger.log('http', message, data);
    } else {
      logger.log('http', message, { data });
    }
  },

  /**
   * Log request with context
   * @param {object} req - Express request object
   * @param {string} message - Additional message
   */
  request: (req, message = '') => {
    logger.log('http', `${message}`, {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  },

  /**
   * Log response with context
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {string} message - Additional message
   */
  response: (req, res, message = '') => {
    logger.log('http', `${message}`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      ip: req.ip,
    });
  },

  /**
   * Get Winston logger instance for advanced usage
   */
  getLogger: () => logger,

  /**
   * Log to file only (always appends to logs/app.log)
   * Use this for persistent logging that you want to review later
   * @param {string} message - Log message
   * @param {any} data - Additional data to log
   */
  file: (message, data = {}) => {
    if (typeof data === 'object') {
      fileLogger.log('info', message, data);
    } else {
      fileLogger.log('info', message, { data });
    }
  },
};

export default loggerWithHelpers;
