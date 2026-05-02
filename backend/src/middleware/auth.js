const crypto = require('crypto');
const { prisma } = require('../database/connection');
const logger = require('../utils/logger');

// Верификация Telegram initData по алгоритму HMAC-SHA256
function verifyTelegramInitData(initDataRaw, botToken) {
  const params = new URLSearchParams(initDataRaw);
  const hash = params.get('hash');
  if (!hash) return null;

  params.delete('hash');

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const expectedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (expectedHash !== hash) return null;

  const authDate = parseInt(params.get('auth_date'), 10);
  // initData протухает через 1 час
  if (Date.now() / 1000 - authDate > 3600) return null;

  const userJson = params.get('user');
  return userJson ? JSON.parse(userJson) : null;
}

const authMiddleware = async (req, res, next) => {
  const botToken = process.env.BOT_TOKEN;
  const isDev = process.env.NODE_ENV !== 'production';

  let telegramUser = null;

  const initData = req.headers['x-telegram-init-data'];

  if (initData && botToken) {
    telegramUser = verifyTelegramInitData(initData, botToken);
    if (!telegramUser) {
      return res.status(401).json({ error: 'Неверные данные Telegram' });
    }
  } else if (isDev) {
    // Dev-режим: фейковый пользователь, если нет initData
    telegramUser = {
      id: parseInt(process.env.DEV_TELEGRAM_ID || '1000000'),
      first_name: process.env.DEV_USER_NAME || 'Dev User',
    };
  } else {
    return res.status(401).json({ error: 'Требуется аутентификация Telegram' });
  }

  try {
    const telegram_id = String(telegramUser.id);
    const name = [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' ');

    let user = await prisma.user.findUnique({ where: { telegram_id } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegram_id,
          name,
          profile: {
            create: { pet_name: 'Ваш питомец' },
          },
        },
        include: { profile: true },
      });
      logger.info({ telegram_id, name }, 'Новый пользователь зарегистрирован');
    }

    req.user = user;
    next();
  } catch (err) {
    logger.error({ err }, 'Ошибка аутентификации');
    res.status(500).json({ error: 'Ошибка при аутентификации' });
  }
};

module.exports = authMiddleware;
module.exports.verifyTelegramInitData = verifyTelegramInitData;
