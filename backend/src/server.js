require('dotenv').config();
const app = require('./app');
const config = require('./config');
const { connect, disconnect } = require('./database/connection');

async function startServer() {
  await connect();

  const server = app.listen(config.server.port, config.server.host, () => {
    console.log(`🚀 Сервер запущен на порту ${config.server.port}`);
    console.log(`📊 Health check: http://localhost:${config.server.port}/health`);
    console.log(`🌍 Окружение: ${config.server.nodeEnv}`);
  });

  async function shutdown(signal) {
    console.log(`🛑 Получен ${signal}, завершение...`);
    server.close(async () => {
      await disconnect();
      process.exit(0);
    });
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('❌ Ошибка запуска сервера:', err);
  process.exit(1);
});
