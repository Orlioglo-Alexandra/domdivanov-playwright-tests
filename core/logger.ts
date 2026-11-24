
import { createLogger, format, transports } from 'winston';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

// Папка для хранения логов
const logsDir = join(process.cwd(), 'logs');
mkdirSync(logsDir, { recursive: true });

// Формат сообщений
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message }) =>
    `[${timestamp}] ${level.toUpperCase()}: ${message}`
  )
);

// Общий логгер фреймворка
export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new transports.Console(),
    new transports.File({
      filename: join(logsDir, 'tests.log'),
    }),
  ],
});
