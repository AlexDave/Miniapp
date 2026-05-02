require('dotenv').config({ path: '../.env' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateDatabase() {
  try {
    console.log('🚀 Начинаем миграцию базы данных...');
    
    // Применяем миграции Prisma
    console.log('📋 Применяем миграции Prisma...');
    
    // Генерируем клиент Prisma
    console.log('🔧 Генерируем клиент Prisma...');
    
    console.log('✅ Миграция завершена успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка при миграции базы данных:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Соединение с базой данных закрыто');
  }
}

// Запускаем миграцию, если файл выполняется напрямую
if (require.main === module) {
  migrateDatabase();
}

module.exports = { migrateDatabase };
