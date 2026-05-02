const express = require('express');
const { prisma } = require('../database/connection');
const { awardXp } = require('../utils/xp');
const { checkAndAwardAchievements } = require('../utils/achievements');

const router = express.Router();

// GET /api/courses/:courseId/lessons — уроки курса с прогрессом пользователя
router.get('/courses/:courseId/lessons', async (req, res) => {
  const courseId = parseInt(req.params.courseId, 10);
  if (isNaN(courseId)) return res.status(400).json({ error: 'Неверный ID курса' });

  try {
    const lessons = await prisma.lesson.findMany({
      where: { course_id: courseId, is_active: true },
      orderBy: { order_index: 'asc' },
      include: {
        userProgress: {
          where: { user_id: req.user.id },
          select: { is_completed: true, completed_at: true },
        },
      },
    });

    const result = lessons.map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      order_index: l.order_index,
      xp_reward: l.xp_reward,
      is_completed: l.userProgress[0]?.is_completed ?? false,
      completed_at: l.userProgress[0]?.completed_at ?? null,
    }));

    res.json(result);
  } catch (err) {
    console.error('❌ Ошибка получения уроков:', err);
    res.status(500).json({ error: 'Ошибка при получении уроков' });
  }
});

// GET /api/lessons/:id — детали урока
router.get('/lessons/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Неверный ID' });

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        userProgress: {
          where: { user_id: req.user.id },
          select: { is_completed: true, completed_at: true },
        },
      },
    });

    if (!lesson || !lesson.is_active) return res.status(404).json({ error: 'Урок не найден' });

    const checklist = lesson.checklist ? JSON.parse(lesson.checklist) : [];

    res.json({
      id: lesson.id,
      course_id: lesson.course_id,
      title: lesson.title,
      description: lesson.description,
      theory: lesson.theory,
      checklist,
      order_index: lesson.order_index,
      xp_reward: lesson.xp_reward,
      is_completed: lesson.userProgress[0]?.is_completed ?? false,
      completed_at: lesson.userProgress[0]?.completed_at ?? null,
    });
  } catch (err) {
    console.error('❌ Ошибка получения урока:', err);
    res.status(500).json({ error: 'Ошибка при получении урока' });
  }
});

// POST /api/lessons/:id/complete — отметить урок выполненным + начислить XP
router.post('/lessons/:id/complete', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Неверный ID' });

  try {
    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson || !lesson.is_active) return res.status(404).json({ error: 'Урок не найден' });

    const existing = await prisma.lessonProgress.findUnique({
      where: { user_id_lesson_id: { user_id: req.user.id, lesson_id: id } },
    });

    if (existing?.is_completed) {
      return res.status(409).json({ error: 'Урок уже выполнен' });
    }

    const now = new Date();

    await prisma.lessonProgress.upsert({
      where: { user_id_lesson_id: { user_id: req.user.id, lesson_id: id } },
      update: { is_completed: true, completed_at: now },
      create: { user_id: req.user.id, lesson_id: id, is_completed: true, completed_at: now },
    });

    // Обновить прогресс курса
    const [totalLessons, completedLessons] = await Promise.all([
      prisma.lesson.count({ where: { course_id: lesson.course_id, is_active: true } }),
      prisma.lessonProgress.count({
        where: { user_id: req.user.id, lesson: { course_id: lesson.course_id }, is_completed: true },
      }),
    ]);

    const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const courseCompleted = progressPct === 100;

    await prisma.courseProgress.upsert({
      where: { user_id_course_id: { user_id: req.user.id, course_id: lesson.course_id } },
      update: { progress: progressPct, is_completed: courseCompleted, last_activity: now, completed_at: courseCompleted ? now : null },
      create: { user_id: req.user.id, course_id: lesson.course_id, progress: progressPct, is_completed: courseCompleted, last_activity: now },
    });

    // Начислить XP
    const xpResult = await awardXp(req.user.id, lesson.xp_reward);

    // Проверить достижения
    const newAchievements = await checkAndAwardAchievements(req.user.id);

    res.json({
      message: 'Урок завершён',
      xp_earned: lesson.xp_reward,
      total_xp: xpResult.xp,
      level: xpResult.level,
      leveled_up: xpResult.leveledUp,
      course_progress: progressPct,
      new_achievements: newAchievements.map((a) => ({ id: a.id, name: a.name, icon: a.icon })),
    });
  } catch (err) {
    console.error('❌ Ошибка завершения урока:', err);
    res.status(500).json({ error: 'Ошибка при завершении урока' });
  }
});

// GET /api/user/today-lesson — следующий незавершённый урок пользователя
router.get('/user/today-lesson', async (req, res) => {
  try {
    const completedIds = (
      await prisma.lessonProgress.findMany({
        where: { user_id: req.user.id, is_completed: true },
        select: { lesson_id: true },
      })
    ).map((p) => p.lesson_id);

    const lesson = await prisma.lesson.findFirst({
      where: { is_active: true, id: { notIn: completedIds.length ? completedIds : [0] } },
      orderBy: [{ course_id: 'asc' }, { order_index: 'asc' }],
      include: { course: { select: { title: true, difficulty: true } } },
    });

    if (!lesson) return res.json(null);

    res.json({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      xp_reward: lesson.xp_reward,
      course_id: lesson.course_id,
      course_title: lesson.course.title,
      course_difficulty: lesson.course.difficulty,
    });
  } catch (err) {
    console.error('❌ Ошибка получения урока дня:', err);
    res.status(500).json({ error: 'Ошибка при получении урока дня' });
  }
});

module.exports = router;
