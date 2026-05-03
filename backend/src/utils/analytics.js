const logger = require('./logger');
const { prisma } = require('../database/connection');

function safeJson(obj) {
  try {
    return JSON.stringify(obj ?? {}, (_, v) => (typeof v === 'bigint' ? String(v) : v));
  } catch {
    return '{}';
  }
}

/**
 * Сохранить событие в БД (не блокирует основной поток при ошибке).
 */
async function persistEvent(userId, name, payload) {
  const uid =
    userId != null && Number.isFinite(Number(userId)) ? Math.floor(Number(userId)) : null;
  await prisma.analyticsEvent.create({
    data: {
      user_id: uid,
      event: String(name).slice(0, 128),
      props: safeJson(payload),
    },
  });
}

/**
 * Структурированные события: лог + таблица analytics_events (спринт 24).
 * user_id в payload (число) привязывает строку к пользователю.
 */
function trackEvent(name, payload = {}) {
  logger.info({ analytics: true, event: name, ...payload }, `evt:${name}`);
  const userId = payload.user_id ?? payload.userId ?? null;
  persistEvent(userId, name, payload).catch((err) => {
    logger.warn({ err, event: name }, 'analytics persist failed');
  });
}

module.exports = { trackEvent, persistEvent };
