const cors = require('cors');
const config = require('../config');

const corsOptions = {
  origin: (origin, callback) => {
    if (
      !origin || // Разрешить запросы без origin
      /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin) || // Локальная сеть с любым портом
      /^http:\/\/localhost(:\d+)?$/.test(origin) || // Локальный хост с любым портом
      /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) // 127.0.0.1 с любым портом
    ) {
      callback(null, true);
    } else {
      callback(new Error('Запрос с этого источника запрещён CORS'));
    }
  },
  credentials: config.cors.credentials
};

const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;
