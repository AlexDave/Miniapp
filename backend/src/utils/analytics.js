const logger = require('./logger');

/**
 * Структурированные события продукта (логируются в JSON для последующей аналитики / ELK).
 */
function trackEvent(name, payload = {}) {
  logger.info({ analytics: true, event: name, ...payload }, `evt:${name}`);
}

module.exports = { trackEvent };
