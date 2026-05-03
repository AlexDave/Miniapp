/** Поля User для buildProfileResponse и онбординга (единый select). */
const USER_AUX_FOR_PROFILE = {
  reminders_enabled: true,
  reminder_time: true,
  reminder_tz: true,
  reminder_quiet_weekends: true,
  telegram_chat_id: true,
  tier: true,
  tier_expires_at: true,
};

module.exports = { USER_AUX_FOR_PROFILE };
