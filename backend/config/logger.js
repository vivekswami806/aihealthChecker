import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, '../../logs');

// ✅ Custom replacer to handle circular references
const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]'; // Return string instead of the circular object
      }
      seen.add(value);
    }
    return value;
  };
};

const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  // ✅ Custom printf with circular reference handling
  winston.format.printf((info) => {
    const { timestamp, level, message, stack, ...meta } = info;
    
    let metaStr = '';
    try {
      // Only stringify if there's metadata
      if (Object.keys(meta).length > 0) {
        // Filter out problematic objects
        const cleanMeta = {};
        for (const [key, value] of Object.entries(meta)) {
          // Skip circular/problematic objects
          if (
            key !== 'res' &&
            key !== 'req' &&
            key !== 'socket' &&
            key !== 'parser' &&
            typeof value !== 'function'
          ) {
            cleanMeta[key] = value;
          }
        }
        metaStr = JSON.stringify(cleanMeta, getCircularReplacer(), 2);
      }
    } catch (error) {
      metaStr = '[Error serializing metadata]';
    }

    // Include stack trace if available
    const stackStr = stack ? `\n${stack}` : '';
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaStr}${stackStr}`;
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { service: 'medical-backend' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // File transport - errors only
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport - all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
      maxsize: 5242880,
      maxFiles: 10,
    }),
  ],
});

export default logger;