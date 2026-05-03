const express = require('express');
const { prisma } = require('../database/connection');
const { getLevelByXP, getNextLevel } = require('../utils/xp');

const router = express.Router();

// Карта навыков — score 0–5 по каждой категории курсов
router.get('/skill-map', async (req, res) => {
  try {
    const userId = req.user.id;

    const courses = await prisma.course.findMany({
      where: { is_active: true },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                reports: { where: { user_id: userId }, select: { id: true, rating: true } },
              },
            },
          },
        },
      },
    });

    const skills = courses.map((course) => {
      const allLessons = course.modules.flatMap((m) => m.lessons);
      const doneLessons = allLessons.filter((l) => l.reports.length > 0);
      const avgRating =
        doneLessons.length > 0
          ? doneLessons.reduce((sum, l) => sum + (l.reports[0]?.rating ?? 2), 0) / doneLessons.length
          : 0;

      // score 0–5: прогресс * качество
      const progress = allLessons.length > 0 ? doneLessons.length / allLessons.length : 0;
      const score = Math.round(progress * avgRating * (5 / 3) * 10) / 10;

      return {
        id: course.id,
        name: course.title,
        category: course.category,
        score: Math.min(score, 5),
        lessons_done: doneLessons.length,
        lessons_total: allLessons.length,
        is_completed: allLessons.length > 0 && doneLessons.length >= allLessons.length,
      };
    });

    res.json({ skills });
  } catch (err) {
    console.error('❌ Ошибка /skill-map:', err);
    res.status(500).json({ error: 'Ошибка при получении карты навыков' });
  }
});

// Тепловая карта активности за последние 90 дней
router.get('/activity', async (req, res) => {
  try {
    const userId = req.user.id;
    const since = new Date();
    since.setDate(since.getDate() - 89);

    const reports = await prisma.dailyReport.findMany({
      where: { user_id: userId, completed_at: { gte: since } },
      select: { completed_at: true, xp_earned: true },
      orderBy: { completed_at: 'asc' },
    });

    // Группируем по дате
    const byDate = {};
    for (const r of reports) {
      const key = new Date(r.completed_at).toISOString().slice(0, 10);
      if (!byDate[key]) byDate[key] = { date: key, xp: 0, lessons_count: 0 };
      byDate[key].xp += r.xp_earned;
      byDate[key].lessons_count += 1;
    }

    // Генерируем все 90 дней (пустые тоже)
    const days = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push(byDate[key] ?? { date: key, xp: 0, lessons_count: 0 });
    }

    res.json({ days });
  } catch (err) {
    console.error('❌ Ошибка /activity:', err);
    res.status(500).json({ error: 'Ошибка при получении активности' });
  }
});

// Расширенная статистика пользователя
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;

    const [profile, reportsCount, completedTracks] = await Promise.all([
      prisma.profile.findUnique({ where: { user_id: userId } }),
      prisma.dailyReport.count({ where: { user_id: userId } }),
      prisma.userTrack.count({ where: { user_id: userId, is_completed: true } }),
    ]);

    // Завершённые модули — уникальные module_id из отчётов пользователя
    const doneReports = await prisma.dailyReport.findMany({
      where: { user_id: userId },
      include: { lesson: { select: { module_id: true } } },
    });
    const modulesData = [...new Set(doneReports.map((r) => r.lesson.module_id))];

    const totalXP = profile?.experience ?? 0;
    const level = getLevelByXP(totalXP);
    const nextLevel = getNextLevel(totalXP);

    const skills = profile?.skills_json
      ? (() => {
          try {
            return JSON.parse(profile.skills_json);
          } catch {
            return {};
          }
        })()
      : {};

    res.json({
      total_xp: totalXP,
      level: level.level,
      level_name: level.name,
      next_level_xp: nextLevel?.min ?? null,
      xp_to_next: nextLevel ? nextLevel.min - totalXP : 0,
      streak: profile?.streak ?? 0,
      coins: profile?.coins ?? 0,
      skills,
      reports_count: reportsCount,
      modules_done: modulesData.length,
      tracks_done: completedTracks,
      kpi: {
        streak_length: profile?.streak ?? 0,
        reports_total: reportsCount,
        tracks_completed: completedTracks,
        hint:
          'Для D1/D7 retention и avg session time добавьте таблицу событий или внешнюю аналитику.',
      },
    });
  } catch (err) {
    console.error('❌ Ошибка /stats:', err);
    res.status(500).json({ error: 'Ошибка при получении статистики' });
  }
});

module.exports = router;
