const express = require('express');
const { prisma } = require('../database/connection');
const logger = require('../utils/logger');
const { trackEvent } = require('../utils/analytics');
const { answerPreCheckoutQuery } = require('../utils/telegramInvoice');
const { computeNewTierExpiresAt } = require('../utils/tier');

const router = express.Router();

function verifyWebhookSecret(req) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) return true;
  return req.get('X-Telegram-Bot-Api-Secret-Token') === expected;
}

async function handlePreCheckout(q) {
  const fromId = q.from?.id != null ? String(q.from.id) : null;
  if (!fromId) {
    await answerPreCheckoutQuery(q.id, false, 'Нет данных пользователя');
    return;
  }
  const user = await prisma.user.findUnique({ where: { telegram_id: fromId } });
  if (!user) {
    await answerPreCheckoutQuery(q.id, false, 'Аккаунт не найден');
    return;
  }
  const pay = await prisma.payment.findFirst({
    where: { payload: q.invoice_payload, user_id: user.id, status: 'pending' },
  });
  const ok =
    !!pay &&
    pay.total_amount === q.total_amount &&
    (q.currency === 'XTR' || q.currency === 'xtr');
  await answerPreCheckoutQuery(q.id, ok, ok ? undefined : 'Счёт не найден или сумма не совпадает');
}

async function handleSuccessfulPayment(msg) {
  const sp = msg.successful_payment;
  if (!sp?.invoice_payload) return;
  const fromId = msg.from?.id != null ? String(msg.from.id) : null;
  if (!fromId) return;

  const user = await prisma.user.findUnique({ where: { telegram_id: fromId } });
  if (!user) return;

  if (sp.telegram_payment_charge_id) {
    const dup = await prisma.payment.findFirst({
      where: { telegram_payment_charge_id: sp.telegram_payment_charge_id, status: 'completed' },
    });
    if (dup) return;
  }

  const pay = await prisma.payment.findFirst({
    where: {
      payload: sp.invoice_payload,
      user_id: user.id,
      status: 'pending',
    },
  });
  if (!pay) return;
  if (pay.total_amount !== sp.total_amount || String(sp.currency).toUpperCase() !== 'XTR') {
    logger.warn({ paymentId: pay.id }, 'successful_payment mismatch');
    return;
  }

  const newExp = computeNewTierExpiresAt(user);

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: pay.id },
      data: {
        status: 'completed',
        telegram_payment_charge_id: sp.telegram_payment_charge_id || null,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { tier: 'pro', tier_expires_at: newExp },
    }),
  ]);

  trackEvent('payment.success', { user_id: user.id, payment_id: pay.id });
}

/**
 * Telegram Bot API: POST updates (message, /start bind_TOKEN, Stars).
 */
router.post('/webhook', async (req, res) => {
  if (!verifyWebhookSecret(req)) {
    return res.status(401).json({ ok: false });
  }

  try {
    const update = req.body;

    if (update.pre_checkout_query) {
      await handlePreCheckout(update.pre_checkout_query);
      return res.json({ ok: true });
    }

    const msg = update?.message;
    if (msg?.successful_payment) {
      await handleSuccessfulPayment(msg);
      return res.json({ ok: true });
    }

    const text = msg?.text;
    const chatId = msg?.chat?.id != null ? String(msg.chat.id) : null;

    if (!text || !chatId) {
      return res.json({ ok: true });
    }

    if (text.startsWith('/start')) {
      const m = /^\/start\s+bind_(.+)$/.exec(text.trim());
      if (m) {
        const token = m[1];
        const row = await prisma.reminderBindToken.findUnique({
          where: { token },
          include: { user: true },
        });
        if (!row || row.expires_at < new Date()) {
          await sendPlain(chatId, 'Ссылка устарела. Откройте приложение → Профиль → Настройки → «Подключить бота» ещё раз.');
          return res.json({ ok: true });
        }

        await prisma.$transaction([
          prisma.user.update({
            where: { id: row.user_id },
            data: { telegram_chat_id: chatId, updated_at: new Date() },
          }),
          prisma.reminderBindToken.delete({ where: { id: row.id } }),
        ]);

        trackEvent('reminder.bot_linked', { user_id: row.user_id, chat_id: chatId });
        await sendPlain(chatId, 'Готово! Напоминания будут приходить сюда. Можно вернуться в приложение.');
        return res.json({ ok: true });
      }

      await sendPlain(
        chatId,
        'Привет! Чтобы получать напоминания о тренировке, откройте мини-приложение → вкладка «Я» → Настройки → кнопка «Подключить бота».'
      );
      return res.json({ ok: true });
    }

    res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, 'telegram webhook error');
    res.status(500).json({ ok: false });
  }
});

async function sendPlain(chatId, text) {
  const token = process.env.BOT_TOKEN;
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  }).catch(() => {});
}

module.exports = router;
