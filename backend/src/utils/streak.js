const { prisma } = require('../database/connection');

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isYesterday(date, now) {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
}

// Гибкий стрик: partial=true не рвёт стрик, но и не увеличивает
// freeze_used: один раз в неделю пропуск не рвёт стрик
async function updateStreak(userId, now, isPartial = false) {
  const profile = await prisma.profile.findUnique({ where: { user_id: userId } });
  if (!profile) return null;

  const lastReport = await prisma.dailyReport.findFirst({
    where: {
      user_id: userId,
      completed_at: { lt: now },
    },
    orderBy: { completed_at: 'desc' },
  });

  let newStreak = profile.streak;
  const preferences = profile.preferences ? JSON.parse(profile.preferences) : {};

  if (!lastReport) {
    newStreak = isPartial ? 0 : 1;
  } else {
    const last = new Date(lastReport.completed_at);

    if (isSameDay(last, now)) {
      // уже занимался сегодня — не меняем
      return profile.streak;
    } else if (isYesterday(last, now)) {
      newStreak = isPartial ? profile.streak : profile.streak + 1;
    } else {
      // пропуск — проверяем заморозку (1 раз в неделю)
      const lastFreeze = preferences.last_freeze_at ? new Date(preferences.last_freeze_at) : null;
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);

      if (lastFreeze && lastFreeze > weekAgo) {
        // заморозка уже использована на этой неделе — сброс
        newStreak = isPartial ? 0 : 1;
      } else {
        // используем заморозку
        preferences.last_freeze_at = now.toISOString();
        await prisma.profile.update({
          where: { user_id: userId },
          data: { preferences: JSON.stringify(preferences) },
        });
        // стрик сохраняется
        return profile.streak;
      }
    }
  }

  await prisma.profile.update({
    where: { user_id: userId },
    data: { streak: newStreak },
  });

  return newStreak;
}

module.exports = { updateStreak, isSameDay };
