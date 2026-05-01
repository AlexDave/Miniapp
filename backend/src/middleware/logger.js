const appLogger = require('../utils/logger');

const logger = (req, res, next) => {
  const start = Date.now();
  appLogger.debug({ method: req.method, url: req.originalUrl }, 'incoming request');

  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;
    appLogger.debug(
      { method: req.method, url: req.originalUrl, status: res.statusCode, duration },
      'request completed'
    );
    originalSend.call(this, data);
  };

  next();
};

module.exports = logger;
