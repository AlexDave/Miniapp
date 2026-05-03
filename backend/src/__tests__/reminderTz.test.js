const {
  formatDateInTimeZone,
  parseReminderTime,
  isWithinReminderWindow,
  wasReminderSentToday,
  isWeekendInZone,
} = require('../utils/reminderTz');

describe('reminderTz', () => {
  test('parseReminderTime', () => {
    expect(parseReminderTime('19:00')).toBe(19 * 60);
    expect(parseReminderTime('09:30')).toBe(9 * 60 + 30);
    expect(parseReminderTime('bad')).toBeNull();
  });

  test('isWithinReminderWindow', () => {
    const d = new Date('2026-05-03T16:05:00Z');
    expect(isWithinReminderWindow(d, 'UTC', '16:05', 20)).toBe(true);
    expect(isWithinReminderWindow(d, 'UTC', '14:00', 20)).toBe(false);
  });

  test('wasReminderSentToday', () => {
    const now = new Date('2026-05-03T12:00:00Z');
    const earlier = new Date('2026-05-03T08:00:00Z');
    expect(wasReminderSentToday(earlier, now, 'UTC')).toBe(true);
    expect(wasReminderSentToday(null, now, 'UTC')).toBe(false);
  });

  test('formatDateInTimeZone stable', () => {
    const d = new Date('2026-05-03T12:00:00Z');
    expect(formatDateInTimeZone(d, 'Europe/Moscow')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('isWeekendInZone', () => {
    const sat = new Date('2026-05-02T12:00:00Z');
    expect(isWeekendInZone(sat, 'UTC')).toBe(true);
  });
});
