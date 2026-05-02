const logger = require('./logger');
const corsMiddleware = require('./cors');
const authMiddleware = require('./auth');

module.exports = {
  logger,
  corsMiddleware,
  authMiddleware
};
