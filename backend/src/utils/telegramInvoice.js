const logger = require('./logger');

async function telegramApi(method, body) {
  const token = process.env.BOT_TOKEN;
  if (!token) throw new Error('BOT_TOKEN не задан');
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!data.ok) {
    logger.warn({ method, data }, 'Telegram API error');
    throw new Error(data.description || `Telegram API: ${method} failed`);
  }
  return data.result;
}

/**
 * Ссылка для Telegram.WebApp.openInvoice (Stars, XTR).
 * @see https://core.telegram.org/bots/api#createinvoicelink
 */
async function createStarsInvoiceLink({
  title,
  description,
  payload,
  amount,
  label = 'Pro',
}) {
  return telegramApi('createInvoiceLink', {
    title: String(title).slice(0, 32),
    description: String(description).slice(0, 255),
    payload: String(payload).slice(0, 128),
    provider_token: '',
    currency: 'XTR',
    prices: [{ label: String(label).slice(0, 32), amount: Math.round(amount) }],
  });
}

async function answerPreCheckoutQuery(preCheckoutQueryId, ok, errorMessage) {
  await telegramApi('answerPreCheckoutQuery', {
    pre_checkout_query_id: preCheckoutQueryId,
    ok: !!ok,
    error_message: ok ? undefined : String(errorMessage || 'Оплата отклонена').slice(0, 200),
  });
}

module.exports = {
  createStarsInvoiceLink,
  answerPreCheckoutQuery,
};
