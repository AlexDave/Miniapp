const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

async function connect() {
  await prisma.$connect();
  const logger = require('../utils/logger');
  logger.info('Подключение к SQLite (Prisma) успешно');
}

async function disconnect() {
  await prisma.$disconnect();
  const logger = require('../utils/logger');
  logger.info('Соединение с БД закрыто');
}

module.exports = { prisma, connect, disconnect };
