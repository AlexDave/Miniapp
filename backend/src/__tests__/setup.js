const path = require('path');

// Use a file-based test DB so prisma db push and the app share the same connection
const testDbPath = path.join(__dirname, '../../prisma/test.db');
process.env.DATABASE_URL = `file:${testDbPath}`;
process.env.NODE_ENV = 'test';
process.env.BOT_TOKEN = 'test_bot_token_12345';
process.env.DEV_TELEGRAM_ID = '9999999';
process.env.DEV_USER_NAME = 'Test User';
process.env.LOG_LEVEL = 'silent';
