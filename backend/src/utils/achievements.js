const { prisma } = require('../database/connection');

async function checkAndAwardAchievements(userId) {
  const [profile, allAchievements, earned, reports, userTracks, doneReports] = await Promise.all([
    prisma.profile.findUnique({ where: { user_id: userId } }),
    prisma.achievement.findMany({ where: { is_active: true } }),
    prisma.userAchievement.findMany({ where: { user_id: userId } }),
    prisma.dailyReport.findMany({ where: { user_id: userId }, orderBy: { completed_at: 'asc' } }),
    prisma.userTrack.findMany({ where: { user_id: userId, is_completed: true } }),
    prisma.dailyReport.findMany({
      where: { user_id: userId },
      include: { lesson: { select: { module_id: true } } },
    }),
  ]);

  const earnedIds = new Set(earned.map((ua) => ua.achievement_id));
  const newlyEarned = [];

  const perfectReports = reports.filter((r) => r.rating === 3).length;

  // Считаем streak отчётов подряд
  let reportsStreak = 0;
  if (reports.length > 0) {
    reportsStreak = 1;
    for (let i = reports.length - 1; i > 0; i--) {
      const curr = new Date(reports[i].completed_at);
      const prev = new Date(reports[i - 1].completed_at);
      const diff = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      if (diff === 1) reportsStreak++;
      else break;
    }
  }

  // Завершённые модули — уникальные module_id у которых есть хотя бы 1 отчёт
  const completedModules = [...new Set(doneReports.map((r) => r.lesson.module_id))];

  for (const achievement of allAchievements) {
    if (earnedIds.has(achievement.id)) continue;

    const condition = JSON.parse(achievement.condition);
    let satisfied = false;

    switch (condition.type) {
      case 'tracks_completed':
        satisfied = userTracks.length >= condition.value;
        break;
      case 'streak':
        satisfied = (profile?.streak ?? 0) >= condition.value;
        break;
      case 'track_speed':
        satisfied = userTracks.some((ut) => {
          if (!ut.started_at || !ut.completed_at) return false;
          const days = Math.ceil((new Date(ut.completed_at) - new Date(ut.started_at)) / 86400000);
          return days <= condition.value;
        });
        break;
      case 'reports_streak':
        satisfied = reportsStreak >= condition.value;
        break;
      case 'perfect_reports':
        satisfied = perfectReports >= condition.value;
        break;
      case 'modules_complete':
        satisfied = completedModules.length >= condition.value;
        break;

      case 'course_completed': {
        const courses = await prisma.course.findMany({
          where: { is_active: true },
          include: {
            modules: {
              include: {
                lessons: { where: { is_active: true }, select: { id: true } },
              },
            },
          },
        });
        let completedCourses = 0;
        for (const c of courses) {
          const ids = c.modules.flatMap((m) => m.lessons.map((l) => l.id));
          if (ids.length === 0) continue;
          const n = await prisma.dailyReport.count({
            where: { user_id: userId, lesson_id: { in: ids } },
          });
          if (n >= ids.length) completedCourses += 1;
        }
        satisfied = completedCourses >= (condition.value ?? 1);
        break;
      }

    }

    if (satisfied) {
      await prisma.userAchievement.create({
        data: { user_id: userId, achievement_id: achievement.id },
      });
      newlyEarned.push({ id: achievement.id, name: achievement.name, icon: achievement.icon, color: achievement.color });
    }
  }

  return newlyEarned;
}

module.exports = { checkAndAwardAchievements };
