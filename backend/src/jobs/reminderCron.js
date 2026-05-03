const cron = require('node-cron');
const { prisma } = require('../database/connection');
const logger = require('../utils/logger');
const { trackEvent } = require('../utils/analytics');
const { telegramSendMessage } = require('../utils/telegramSend');
const {
  formatDateInTimeZone,
  isWeekendInZone,
  isWithinReminderWindow,
  wasReminderSentToday,
} = require('../utils/reminderTz');

let started = false;

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function hasReportOnLocalDay(userId, tz, now) {
  const since = new Date(now.getTime() - 40 * 3600000);
  const rows = await prisma.dailyReport.findMany({
    where: { user_id: userId, completed_at: { gte: since } },
    select: { completed_at: true },
  });
  const today = formatDateInTimeZone(now, tz);
  return rows.some((r) => formatDateInTimeZone(r.completed_at, tz) === today);
}

async function runReminderTick() {
  if (!process.env.BOT_TOKEN) return;

  const webAppUrl = (process.env.WEB_APP_URL || '').trim();
  const now = new Date();

  try {
    await prisma.reminderBindToken.deleteMany({ where: { expires_at: { lt: now } } });
  } catch (e) {
    logger.warn({ e }, 'reminder token cleanup');
  }

  const users = await prisma.user.findMany({
    where: {
      reminders_enabled: true,
      telegram_chat_id: { not: null },
      NOT: { reminder_time: null },
    },
    include: { profile: { select: { pet_name: true } } },
  });

  for (const u of users) {
    const tz = u.reminder_tz || 'Europe/Moscow';
    const rt = u.reminder_time || '19:00';
    try {
      if (u.reminder_quiet_weekends && isWeekendInZone(now, tz)) continue;
      if (!isWithinReminderWindow(now, tz, rt, 14)) continue;
      if (wasReminderSentToday(u.last_reminder_sent_at, now, tz)) continue;
      if (await hasReportOnLocalDay(u.id, tz, now)) continue;

      const pet = u.profile?.pet_name || 'Питомец';
      const text = `🐾 <b>${escapeHtml(pet)}</b> ждёт 5 минут практики. Загляни в урок дня!`;
      const r = await telegramSendMessage(u.telegram_chat_id, text, webAppUrl ? { webAppUrl } : {});

      if (r.ok) {
        await prisma.user.update({
          where: { id: u.id },
          data: { last_reminder_sent_at: now, updated_at: new Date() },
        });
        trackEvent('reminder.sent', { user_id: u.id });
      }
    } catch (e) {
      logger.error({ e, userId: u.id }, 'reminder tick user');
    }
  }
}

function startReminderCron() {
  if (started) return;
  started = true;
  cron.schedule('*/10 * * * *', () => {
    runReminderTick().catch((err) => logger.error({ err }, 'reminder cron'));
  });
  logger.info('Напоминания: cron каждые 10 минут (окно ±14 мин от reminder_time)');
}

module.exports = { startReminderCron, runReminderTick };
