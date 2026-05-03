require('dotenv').config();
const app = require('./app');
const config = require('./config');
const { connect, disconnect } = require('./database/connection');
const logger = require('./utils/logger');
const { startReminderCron } = require('./jobs/reminderCron');

async function startServer() {
  await connect();
  startReminderCron();

  const server = app.listen(config.server.port, config.server.host, () => {
    logger.info({ port: config.server.port, env: config.server.nodeEnv }, 'Сервер запущен');
  });

  async function shutdown(signal) {
    logger.info({ signal }, 'Получен сигнал завершения');
    server.close(async () => {
      await disconnect();
      process.exit(0);
    });
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  // logger может быть недоступен до инициализации, используем console.error здесь
  console.error('Ошибка запуска сервера:', err);
  process.exit(1);
});
