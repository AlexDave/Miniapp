const express = require('express');
const { prisma } = require('../database/connection');
const { getLevelByXP, getNextLevel } = require('../utils/xp');
const { trophyStreamQuery } = require('../utils/trophyVideoSign');
const { getPetIdForUser } = require('../utils/petContext');

const router = express.Router();

// Карта навыков — score 0–5 по каждой категории курсов
router.get('/skill-map', async (req, res) => {
  try {
    const userId = req.user.id;
    const petId = await getPetIdForUser(userId);

    const courses = await prisma.course.findMany({
      where: { is_active: true },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                reports: { where: { pet_id: petId }, select: { id: true, rating: true } },
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
    const petId = await getPetIdForUser(userId);
    const since = new Date();
    since.setDate(since.getDate() - 89);

    const reports = await prisma.dailyReport.findMany({
      where: { pet_id: petId, completed_at: { gte: since } },
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
    const petId = await getPetIdForUser(userId);

    const [profile, pet, reportsCount] = await Promise.all([
      prisma.profile.findUnique({ where: { user_id: userId } }),
      prisma.pet.findUnique({ where: { id: petId } }),
      prisma.dailyReport.count({ where: { pet_id: petId } }),
    ]);

    // Завершённые модули — уникальные module_id из отчётов пользователя
    const doneReports = await prisma.dailyReport.findMany({
      where: { pet_id: petId },
      include: { lesson: { select: { module_id: true } } },
    });
    const modulesData = [...new Set(doneReports.map((r) => r.lesson.module_id))];

    const totalXP = pet?.experience ?? profile?.experience ?? 0;
    const level = getLevelByXP(totalXP);
    const nextLevel = getNextLevel(totalXP);

    const skillsJson = pet?.skills_json ?? profile?.skills_json;
    const skills = skillsJson
      ? (() => {
          try {
            return JSON.parse(skillsJson);
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
      streak: pet?.streak ?? profile?.streak ?? 0,
      coins: pet?.coins ?? profile?.coins ?? 0,
      skills,
      reports_count: reportsCount,
      modules_done: modulesData.length,
      tracks_done: 0,
      kpi: {
        streak_length: pet?.streak ?? profile?.streak ?? 0,
        reports_total: reportsCount,
        tracks_completed: 0,
        hint:
          'Для D1/D7 retention и avg session time добавьте таблицу событий или внешнюю аналитику.',
      },
    });
  } catch (err) {
    console.error('❌ Ошибка /stats:', err);
    res.status(500).json({ error: 'Ошибка при получении статистики' });
  }
});

/** Короткие видео после уроков (полка в профиле) */
router.get('/trophy-videos', async (req, res) => {
  try {
    const userId = req.user.id;
    const rows = await prisma.userTrophyVideo.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 40,
    });
    const videos = rows.map((v) => ({
      id: v.id,
      lesson_id: v.lesson_id,
      skill_key: v.skill_key,
      atomic_outcome_snapshot: v.atomic_outcome_snapshot,
      mime_type: v.mime_type,
      size_bytes: v.size_bytes,
      created_at: v.created_at,
      stream_url: `/api/media/trophy/${v.id}${trophyStreamQuery(v.user_id, v.id)}`,
    }));
    res.json({ videos });
  } catch (err) {
    console.error('❌ Ошибка GET /user/trophy-videos:', err);
    res.status(500).json({ error: 'Ошибка при получении видео' });
  }
});

module.exports = router;
