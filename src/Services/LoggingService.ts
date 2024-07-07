import winston, { format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Define the log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.json()
);

// Create a Winston logger instance
export const logger = winston.createLogger({
  level: 'info', // Set default logging level
  format: logFormat,
  transports: [
    // Log to console
    new winston.transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    // Log to daily rotating file using winston-daily-rotate-file
    new DailyRotateFile({
      filename: './logs/server-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m', // Max size of log file before rotation
      maxFiles: '7d', // Retain logs for 7 days
    }),
  ],
});
