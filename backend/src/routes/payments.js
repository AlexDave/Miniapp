const express = require('express');
const crypto = require('crypto');
const { prisma } = require('../database/connection');
const logger = require('../utils/logger');
const { createStarsInvoiceLink } = require('../utils/telegramInvoice');
const { trackEvent } = require('../utils/analytics');

const router = express.Router();

function starsProAmount() {
  const n = parseInt(process.env.STARS_PRO_MONTH_AMOUNT || '100', 10);
  return Number.isFinite(n) && n >= 1 && n <= 1_000_000 ? n : 100;
}

/**
 * POST /api/payments/stars-invoice
 * body: { plan?: 'pro_month' } — ссылка для openInvoice в Mini App.
 */
router.post('/stars-invoice', async (req, res) => {
  try {
    const plan = req.body?.plan === 'pro_month' ? 'pro_month' : 'pro_month';
    const userId = req.user.id;

    if (!process.env.BOT_TOKEN) {
      return res.status(503).json({ error: 'Платежи недоступны: не настроен бот' });
    }

    const amount = starsProAmount();
    const payload = `pro_${userId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`.slice(0, 128);

    await prisma.payment.create({
      data: {
        user_id: userId,
        payload,
        total_amount: amount,
        currency: 'XTR',
        status: 'pending',
        plan,
      },
    });

    const invoiceUrl = await createStarsInvoiceLink({
      title: 'DogCourse Pro',
      description: `Подписка Pro — ${process.env.PRO_SUBSCRIPTION_DAYS || 30} дней (маршруты Премиум)`,
      payload,
      amount,
      label: 'Pro',
    });

    trackEvent('payment.invoice_created', { user_id: userId, plan, amount });

    res.json({ invoice_url: invoiceUrl, amount, currency: 'XTR', plan });
  } catch (err) {
    logger.error({ err }, 'POST /payments/stars-invoice');
    res.status(500).json({ error: err.message || 'Не удалось создать счёт' });
  }
});

module.exports = router;
