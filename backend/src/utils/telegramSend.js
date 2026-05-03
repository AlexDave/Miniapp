const logger = require('./logger');

/**
 * @param {string} chatId
 * @param {string} text
 * @param {{ webAppUrl?: string }} [opts]
 */
async function telegramSendMessage(chatId, text, opts = {}) {
  const token = process.env.BOT_TOKEN;
  if (!token || !chatId) {
    logger.warn({ chatId }, 'telegramSendMessage: пропуск — нет BOT_TOKEN или chat_id');
    return { ok: false, skipped: true };
  }
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
  };
  if (opts.webAppUrl) {
    body.reply_markup = {
      inline_keyboard: [
        [{ text: 'Открыть тренировку', web_app: { url: opts.webAppUrl } }],
      ],
    };
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!json.ok) {
      logger.error({ json, chatId }, 'telegram sendMessage failed');
    }
    return json;
  } catch (err) {
    logger.error({ err, chatId }, 'telegram sendMessage error');
    return { ok: false, error: String(err) };
  }
}

module.exports = { telegramSendMessage };
