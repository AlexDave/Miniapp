const express = require('express');
const { prisma } = require('../database/connection');
const { calculateXP, getLevelByXP, getNextLevel } = require('../utils/xp');
const { updateStreak } = require('../utils/streak');
const { checkAndAwardAchievements } = require('../utils/achievements');

const router = express.Router();

// Найти первый незавершённый урок пользователя
router.get('/today', async (req, res) => {
  try {
    const userId = req.user.id;

    // Все отчёты пользователя — знаем какие уроки пройдены
    const doneReports = await prisma.dailyReport.findMany({
      where: { user_id: userId },
      select: { lesson_id: true },
    });
    const doneIds = new Set(doneReports.map((r) => r.lesson_id));

    // Берём все уроки из активных модулей активных курсов по порядку
    const lessons = await prisma.lesson.findMany({
      where: { is_active: true, module: { is_active: true, course: { is_active: true } } },
      include: {
        module: { include: { course: { select: { id: true, title: true, category: true } } } },
        daily_task: { include: { steps: { orderBy: { order_index: 'asc' } } } },
      },
      orderBy: [
        { module: { course: { id: 'asc' } } },
        { module: { order_index: 'asc' } },
        { order_index: 'asc' },
      ],
    });

    const todayLesson = lessons.find((l) => !doneIds.has(l.id));

    if (!todayLesson) {
      return res.json({ lesson: null, message: 'Все уроки завершены!' });
    }

    // Прогресс по модулю
    const moduleLessons = lessons.filter((l) => l.module_id === todayLesson.module_id);
    const moduleDone = moduleLessons.filter((l) => doneIds.has(l.id)).length;

    res.json({
      lesson: {
        id: todayLesson.id,
        title: todayLesson.title,
        description: todayLesson.description,
        theory: todayLesson.theory,
        xp_reward: todayLesson.xp_reward,
        order_index: todayLesson.order_index,
        daily_task: todayLesson.daily_task,
      },
      module: {
        id: todayLesson.module.id,
        title: todayLesson.module.title,
        total: moduleLessons.length,
        done: moduleDone,
      },
      course: todayLesson.module.course,
      is_completed: false,
    });
  } catch (err) {
    console.error('❌ Ошибка /lessons/today:', err);
    res.status(500).json({ error: 'Ошибка при получении урока дня' });
  }
});

// Список модулей курса с прогрессом
router.get('/course/:courseId/modules', async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId, 10);
    const userId = req.user.id;

    const modules = await prisma.module.findMany({
      where: { course_id: courseId, is_active: true },
      include: {
        lessons: {
          where: { is_active: true },
          include: { reports: { where: { user_id: userId }, select: { id: true } } },
          orderBy: { order_index: 'asc' },
        },
      },
      orderBy: { order_index: 'asc' },
    });

    const result = modules.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      order_index: m.order_index,
      lessons_total: m.lessons.length,
      lessons_done: m.lessons.filter((l) => l.reports.length > 0).length,
      is_completed: m.lessons.length > 0 && m.lessons.every((l) => l.reports.length > 0),
    }));

    res.json(result);
  } catch (err) {
    console.error('❌ Ошибка /lessons/course/:id/modules:', err);
    res.status(500).json({ error: 'Ошибка при получении модулей' });
  }
});

// Уроки модуля с полным контентом и статусом
router.get('/module/:moduleId', async (req, res) => {
  try {
    const moduleId = parseInt(req.params.moduleId, 10);
    const userId = req.user.id;

    const [module, doneReports] = await Promise.all([
      prisma.module.findUnique({
        where: { id: moduleId },
        include: {
          lessons: {
            where: { is_active: true },
            include: {
              steps: { orderBy: { order_index: 'asc' } },
              daily_task: { include: { steps: { orderBy: { order_index: 'asc' } } } },
            },
            orderBy: { order_index: 'asc' },
          },
        },
      }),
      prisma.dailyReport.findMany({
        where: { user_id: userId },
        select: { lesson_id: true },
      }),
    ]);

    if (!module) return res.status(404).json({ error: 'Модуль не найден' });

    const doneIds = new Set(doneReports.map((r) => r.lesson_id));
    let firstUnlocked = false;

    const lessons = module.lessons.map((l) => {
      const isDone = doneIds.has(l.id);
      const isCurrent = !isDone && !firstUnlocked;
      if (isCurrent) firstUnlocked = true;
      return {
        id: l.id,
        title: l.title,
        description: l.description,
        xp_reward: l.xp_reward,
        order_index: l.order_index,
        status: isDone ? 'completed' : isCurrent ? 'current' : 'locked',
        steps: isDone || isCurrent ? l.steps : [],
        daily_task: isDone || isCurrent ? l.daily_task : null,
      };
    });

    res.json({ module: { id: module.id, title: module.title }, lessons });
  } catch (err) {
    console.error('❌ Ошибка /lessons/module/:id:', err);
    res.status(500).json({ error: 'Ошибка при получении уроков модуля' });
  }
});

// Получить конкретный урок (для показа теории и задания)
router.get('/:lessonId', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.lessonId, 10);
    const userId = req.user.id;

    const [lesson, report] = await Promise.all([
      prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          steps: { orderBy: { order_index: 'asc' } },
          daily_task: { include: { steps: { orderBy: { order_index: 'asc' } } } },
          module: { include: { course: { select: { id: true, title: true } } } },
        },
      }),
      prisma.dailyReport.findUnique({
        where: { user_id_lesson_id: { user_id: userId, lesson_id: lessonId } },
      }),
    ]);

    if (!lesson) return res.status(404).json({ error: 'Урок не найден' });

    res.json({ lesson, report: report ?? null });
  } catch (err) {
    console.error('❌ Ошибка /lessons/:id:', err);
    res.status(500).json({ error: 'Ошибка при получении урока' });
  }
});

// Получить отчёт пользователя за урок
router.get('/:lessonId/report', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.lessonId, 10);
    const report = await prisma.dailyReport.findUnique({
      where: { user_id_lesson_id: { user_id: req.user.id, lesson_id: lessonId } },
    });
    res.json(report ?? null);
  } catch (err) {
    console.error('❌ Ошибка GET /lessons/:id/report:', err);
    res.status(500).json({ error: 'Ошибка при получении отчёта' });
  }
});

// Сохранить отчёт за урок + начислить XP
router.post('/:lessonId/report', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.lessonId, 10);
    const userId = req.user.id;
    const { steps_data = [], rating = 2, note = '' } = req.body;

    if (rating < 1 || rating > 3) {
      return res.status(400).json({ error: 'rating должен быть от 1 до 3' });
    }

    // Проверить что урок не пройден
    const existing = await prisma.dailyReport.findUnique({
      where: { user_id_lesson_id: { user_id: userId, lesson_id: lessonId } },
    });
    if (existing) {
      return res.status(409).json({ error: 'Этот урок уже завершён' });
    }

    // Получить урок для xp_reward и проверки модуля
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { lessons: { select: { id: true } } } } },
    });
    if (!lesson) return res.status(404).json({ error: 'Урок не найден' });

    // Обновить стрик
    const now = new Date();
    const newStreak = await updateStreak(userId, now, false);

    // Проверить завершение модуля
    const allModuleLessonIds = lesson.module.lessons.map((l) => l.id);
    const doneInModule = await prisma.dailyReport.count({
      where: { user_id: userId, lesson_id: { in: allModuleLessonIds } },
    });
    const isModuleComplete = doneInModule + 1 >= allModuleLessonIds.length;

    // Считаем XP
    const hasData = steps_data.some((s) => s.value !== null && s.value !== '' && s.value !== false && s.value !== 0);
    const profile = await prisma.profile.findUnique({ where: { user_id: userId } });
    const xpEarned = calculateXP(rating, hasData, newStreak ?? profile?.streak ?? 0, isModuleComplete);

    // Создать отчёт и обновить XP в транзакции
    const oldXP = profile?.experience ?? 0;
    const newXP = oldXP + xpEarned;
    const oldLevel = getLevelByXP(oldXP);
    const newLevel = getLevelByXP(newXP);

    const [report] = await prisma.$transaction([
      prisma.dailyReport.create({
        data: {
          user_id: userId,
          lesson_id: lessonId,
          steps_data: JSON.stringify(steps_data),
          rating,
          note: note || null,
          xp_earned: xpEarned,
        },
      }),
      prisma.profile.update({
        where: { user_id: userId },
        data: { experience: newXP },
      }),
    ]);

    // Проверить достижения асинхронно
    const newAchievements = await checkAndAwardAchievements(userId);

    res.status(201).json({
      report,
      xp_earned: xpEarned,
      total_xp: newXP,
      level: newLevel,
      level_up: newLevel.level > oldLevel.level,
      streak: newStreak ?? profile?.streak ?? 0,
      module_complete: isModuleComplete,
      achievements_unlocked: newAchievements,
    });
  } catch (err) {
    console.error('❌ Ошибка POST /lessons/:id/report:', err);
    res.status(500).json({ error: 'Ошибка при сохранении отчёта' });
  }
});

module.exports = router;
