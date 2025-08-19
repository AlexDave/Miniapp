require('dotenv').config();
const app = require('./app');
const config = require('./config');
const database = require('./database/connection');

// Функция запуска сервера
async function startServer() {
  try {
    // Подключение к базе данных
    await database.connect();
    
    // Запуск сервера
    app.listen(config.server.port, config.server.host, () => {
      console.log(`🚀 Сервер запущен на порту ${config.server.port}`);
      console.log(`📊 Health check: http://localhost:${config.server.port}/health`);
      console.log(`🌍 Окружение: ${config.server.nodeEnv}`);
    });
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error);
    // Не завершаем процесс, позволяем серверу запуститься без БД
    app.listen(config.server.port, config.server.host, () => {
      console.log(`🚀 Сервер запущен на порту ${config.server.port} (без БД)`);
      console.log(`📊 Health check: http://localhost:${config.server.port}/health`);
      console.log(`🌍 Окружение: ${config.server.nodeEnv}`);
    });
  }
}

// Запуск сервера
startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Получен сигнал SIGTERM, закрытие сервера...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Получен сигнал SIGINT, закрытие сервера...');
  process.exit(0);
});
