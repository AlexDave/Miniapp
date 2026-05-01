const pino = require('pino');

const logger = pino(
  {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    base: null, // убираем pid и hostname
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  process.env.NODE_ENV !== 'production'
    ? pino.transport({ target: 'pino-pretty', options: { colorize: true, ignore: 'time' } })
    : process.stdout
);

module.exports = logger;
