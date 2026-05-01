const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

async function connect() {
  await prisma.$connect();
  console.log('✅ Подключение к SQLite (Prisma) успешно');
}

async function disconnect() {
  await prisma.$disconnect();
  console.log('🔌 Соединение с БД закрыто');
}

module.exports = { prisma, connect, disconnect };
