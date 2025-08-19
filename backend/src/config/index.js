const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const config = {
  // Database Configuration
  database: {
    uri: process.env.DATABASE_URL || 'mongodb://localhost:27017/dogcourse',
    dbName: process.env.DB_NAME || 'dogcourse',
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // Application Configuration
  app: {
    telegramId: process.env.TELEGRAM_ID || 'fake_telegram_id',
    userName: process.env.USER_NAME || 'Test User',
  },
};

// Отладочная информация
console.log('🔧 Загруженные переменные окружения:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Установлен' : 'Не установлен');
console.log('DB_NAME:', process.env.DB_NAME || 'По умолчанию');
console.log('PORT:', process.env.PORT || 'По умолчанию');
console.log('NODE_ENV:', process.env.NODE_ENV || 'По умолчанию');

module.exports = config;
