// src/config/db.js

import { PrismaClient } from '@prisma/client';
import logger from './logger.js';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'stdout',
        level: 'error',
      },
      {
        emit: 'stdout',
        level: 'warn',
      },
    ],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Query Logging
 */
prisma.$on('query', (event) => {
  logger.debug('Prisma Query Executed', {
    query: event.query,
    params: event.params,
    duration: `${event.duration}ms`,
    target: event.target,
  });
});

/**
 * Connect Database
 */
export async function connectDB() {
  try {
    await prisma.$connect();

    logger.info(' PostgreSQL connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed', {
      error: error.message,
    });

    process.exit(1);
  }
}

/**
 * Disconnect Database
 */
export async function disconnectDB() {
  try {
    await prisma.$disconnect();

    logger.info('📦 Database disconnected successfully');
  } catch (error) {
    logger.error('❌ Error disconnecting database', {
      error: error.message,
    });
  }
}

/**
 * Graceful Shutdown
 */
process.on('SIGINT', async () => {
  logger.warn('SIGINT received. Closing database connection...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.warn('SIGTERM received. Closing database connection...');
  await disconnectDB();
  process.exit(0);
});

export default prisma;