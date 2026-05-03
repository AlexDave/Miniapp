/**
 * Дата YYYY-MM-DD в календарной зоне пользователя (для «сегодня» / анти-спама).
 */
function formatDateInTimeZone(date, timeZone) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone || 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-CA').format(date);
  }
}

/** @returns {number|null} минуты от полуночи 0..1439 */
function parseReminderTime(str) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(str || '').trim());
  if (!m) return null;
  const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
  const min = Math.min(59, Math.max(0, parseInt(m[2], 10)));
  return h * 60 + min;
}

function zonedWeekdayShort(date, timeZone) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone || 'UTC',
      weekday: 'short',
    }).format(date);
  } catch {
    try {
      return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short' }).format(date);
    } catch {
      return 'Mon';
    }
  }
}

function zonedMinutesFromMidnight(date, timeZone) {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: timeZone || 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(date);
    const hour = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10);
    const minute = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10);
    return hour * 60 + minute;
  } catch {
    const d = new Date(date);
    return d.getUTCHours() * 60 + d.getUTCMinutes();
  }
}

function isWeekendInZone(date, timeZone) {
  const w = zonedWeekdayShort(date, timeZone);
  return w === 'Sat' || w === 'Sun';
}

/**
 * Срабатывание напоминания: текущее локальное время пользователя попало
 * в окно [reminder_time, reminder_time + windowMinutes).
 */
function isWithinReminderWindow(now, timeZone, reminderTimeStr, windowMinutes = 14) {
  const target = parseReminderTime(reminderTimeStr);
  if (target == null) return false;
  const cur = zonedMinutesFromMidnight(now, timeZone);
  let diff = cur - target;
  if (diff < 0) diff += 24 * 60;
  return diff >= 0 && diff < windowMinutes;
}

function wasReminderSentToday(lastSent, now, timeZone) {
  if (!lastSent) return false;
  return formatDateInTimeZone(lastSent, timeZone) === formatDateInTimeZone(now, timeZone);
}

module.exports = {
  formatDateInTimeZone,
  parseReminderTime,
  zonedMinutesFromMidnight,
  isWeekendInZone,
  isWithinReminderWindow,
  wasReminderSentToday,
};
