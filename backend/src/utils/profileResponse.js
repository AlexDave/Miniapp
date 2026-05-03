const { parsePreferences, preferencesToPublic } = require('./profilePreferences');
const { parseBones } = require('./bones');
const { isUserProEffective, isWithinPaidPeriod } = require('./tier');

/** @param pet {import('@prisma/client').Pet | null} — игровой прогресс (спринт 26) */
function buildProfileResponse(profile, userReminder = null, pet = null) {
  const g = pet && profile.pet_id ? pet : profile;
  let skills = { focus: 0, recall: 0, sit: 0 };
  try {
    skills = g.skills_json ? { ...skills, ...JSON.parse(g.skills_json) } : skills;
  } catch {
    /* ignore */
  }

  const prefs = parsePreferences(profile.preferences);
  const publicPrefs = preferencesToPublic(prefs);

  const u = userReminder || {};
  const userForTier = {
    tier: u.tier,
    tier_expires_at: u.tier_expires_at,
  };

  return {
    id: profile.id,
    petName: pet && profile.pet_id ? pet.name : profile.pet_name,
    avatar: profile.avatar,
    level: g.level,
    experience: g.experience,
    coins: g.coins ?? 0,
    skills,
    totalCourses: g.total_courses,
    completedCourses: g.completed_courses,
    streak: g.streak,
    bio: profile.bio,
    totalBones: g.total_bones ?? 0,
    specialBones: g.special_bones ?? 0,
    stage: g.stage ?? 'Знакомство',
    bones: parseBones(g.bones_json),
    ...publicPrefs,
    remindersEnabled: u.reminders_enabled === true,
    reminderTime: u.reminder_time ?? '19:00',
    reminderTz: u.reminder_tz ?? 'Europe/Moscow',
    reminderQuietWeekends: u.reminder_quiet_weekends === true,
    reminderBotLinked: !!u.telegram_chat_id,
    tier: u.tier ?? 'free',
    tierExpiresAt: u.tier_expires_at ? new Date(u.tier_expires_at).toISOString() : null,
    isPro: isUserProEffective(userForTier),
    isProPaidPeriod: isWithinPaidPeriod(userForTier),
  };
}

module.exports = { buildProfileResponse };
