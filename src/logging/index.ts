import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

const createFileTransport = (name: string, level?: string) => new DailyRotateFile({
  dirname: 'logs',
  filename: `${name}-%DATE%.log`,
  datePattern: 'YYYY-MM-DD-HH',
  maxSize: '20m',
  maxFiles: '14d',
  level,
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    createFileTransport('error', 'error'),
    createFileTransport('combined'),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.simple(),
      winston.format.printf((msg) =>
        `${msg.level} - ${msg.timestamp}: ${msg.message}`
      ),
    ),
  }));
}

export default logger;
