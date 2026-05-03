const { prisma } = require('../database/connection');

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * Стрик растёт только при success === 'yes' (как в плане: при «нет» стрик не увеличивается).
 * Легаси-отчёты без поля success считаются успешными.
 */
async function updateStreakAfterLessonReport(userId, completedAt, success, excludeReportId) {
  const profile = await prisma.profile.findUnique({ where: { user_id: userId } });
  if (!profile) return 0;

  const countsAsSuccess = success === null || success === undefined || success === 'yes';
  if (!countsAsSuccess) {
    return profile.streak;
  }

  const now = new Date(completedAt);
  const todayStart = startOfDay(now);

  const earlierToday = await prisma.dailyReport.findFirst({
    where: {
      user_id: userId,
      ...(excludeReportId ? { id: { not: excludeReportId } } : {}),
      completed_at: { gte: todayStart, lt: now },
      OR: [{ success: null }, { success: 'yes' }],
    },
    orderBy: { completed_at: 'desc' },
  });

  if (earlierToday) {
    return profile.streak;
  }

  const lastYesBeforeToday = await prisma.dailyReport.findFirst({
    where: {
      user_id: userId,
      OR: [{ success: null }, { success: 'yes' }],
      completed_at: { lt: todayStart },
    },
    orderBy: { completed_at: 'desc' },
  });

  let newStreak = 1;
  if (lastYesBeforeToday) {
    const lastDay = startOfDay(lastYesBeforeToday.completed_at);
    const yesterday = new Date(todayStart);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(lastDay, yesterday)) {
      newStreak = profile.streak + 1;
    } else if (isSameDay(lastDay, todayStart)) {
      newStreak = profile.streak;
    }
  }

  await prisma.profile.update({
    where: { user_id: userId },
    data: { streak: newStreak },
  });

  return newStreak;
}

module.exports = { updateStreakAfterLessonReport, startOfDay, isSameDay };
