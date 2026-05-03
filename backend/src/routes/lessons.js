const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const { prisma } = require('../database/connection');
const { calculateLessonReportXP, getLevelByXP } = require('../utils/xp');
const { parseLessonMeta, applySkillDelta, normalizeSkills } = require('../utils/lessonMeta');
const { updateStreakAfterLessonReport } = require('../utils/streakLesson');
const { checkAndAwardAchievements } = require('../utils/achievements');
const { awardBone } = require('../utils/bones');
const { trackEvent } = require('../utils/analytics');
const {
  ensureFallbackTreeOnLesson,
  mergeNoAttempt,
  parseAttemptsAtLevel,
} = require('../utils/fallbackTree');
const { getPetIdForUser } = require('../utils/petContext');

const router = express.Router();

const trophyVideoStorage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = path.join(__dirname, '../../public/user-videos');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    const lessonId = parseInt(req.params.lessonId, 10);
    const ext = path.extname(file.originalname || '').toLowerCase();
    const allowed = ['.mp4', '.webm', '.mov'];
    const safe = allowed.includes(ext) ? ext : '.mp4';
    cb(null, `${req.user.id}_${lessonId}_${crypto.randomUUID()}${safe}`);
  },
});

const trophyVideoUpload = multer({
  storage: trophyVideoStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!file.mimetype || !file.mimetype.startsWith('video/')) {
      cb(new Error('Нужен видеофайл'));
      return;
    }
    cb(null, true);
  },
});

function handleTrophyVideoUpload(req, res, next) {
  trophyVideoUpload.single('video')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'Видео не больше 10 МБ' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) return res.status(400).json({ error: String(err.message || err) });
    next();
  });
}

function lessonDto(lesson) {
  if (!lesson) return null;
  const out = { ...lesson };
  if (typeof out.meta === 'string' && out.meta) {
    try {
      out.meta = JSON.parse(out.meta);
    } catch {
      out.meta = null;
    }
  }
  if (typeof out.fallback_tree === 'string' && out.fallback_tree) {
    try {
      out.fallback_tree = JSON.parse(out.fallback_tree);
    } catch {
      out.fallback_tree = null;
    }
  }
  return out;
}

function parseCourseContent(contentStr) {
  if (!contentStr) return {};
  try {
    return JSON.parse(contentStr);
  } catch {
    return {};
  }
}

function skillRequirementsMet(requires, skills) {
  if (!requires) return true;
  for (const [k, v] of Object.entries(requires)) {
    if ((skills[k] ?? 0) < v) return false;
  }
  return true;
}

// Найти первый незавершённый урок пользователя
router.get('/today', async (req, res) => {
  try {
    const userId = req.user.id;
    const petId = await getPetIdForUser(userId);

    const doneReports = await prisma.dailyReport.findMany({
      where: { pet_id: petId },
      select: { lesson_id: true },
    });
    const doneIds = new Set(doneReports.map((r) => r.lesson_id));

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

    const moduleLessons = lessons.filter((l) => l.module_id === todayLesson.module_id);
    const moduleDone = moduleLessons.filter((l) => doneIds.has(l.id)).length;

    const tl = ensureFallbackTreeOnLesson(lessonDto(todayLesson));
    res.json({
      lesson: {
        id: tl.id,
        title: tl.title,
        description: tl.description,
        theory: tl.theory,
        xp_reward: tl.xp_reward,
        order_index: tl.order_index,
        meta: tl.meta,
        fallback_tree: tl.fallback_tree,
        daily_task: tl.daily_task,
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

router.get('/course/:courseId/modules', async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId, 10);
    const userId = req.user.id;
    const petId = await getPetIdForUser(userId);

    const modules = await prisma.module.findMany({
      where: { course_id: courseId, is_active: true },
      include: {
        lessons: {
          where: { is_active: true },
          include: { reports: { where: { pet_id: petId }, select: { id: true } } },
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

// Уроки модуля: skill-tree + гибрид с линейным fallback
router.get('/module/:moduleId', async (req, res) => {
  try {
    const moduleId = parseInt(req.params.moduleId, 10);
    const userId = req.user.id;
    const petId = await getPetIdForUser(userId);

    const [module, doneReports, profile] = await Promise.all([
      prisma.module.findUnique({
        where: { id: moduleId },
        include: {
          course: { select: { content: true } },
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
        where: { pet_id: petId },
        select: { lesson_id: true },
      }),
      prisma.profile.findUnique({ where: { user_id: userId }, include: { pet: true } }),
    ]);

    if (!module) return res.status(404).json({ error: 'Модуль не найден' });

    const doneIds = new Set(doneReports.map((r) => r.lesson_id));
    const skills = normalizeSkills(profile?.pet?.skills_json ?? profile?.skills_json);
    const { skill_tree: skillTree } = parseCourseContent(module.course?.content);
    const unlock = skillTree?.unlock ?? [];

    const sorted = [...module.lessons];

    function isLessonAccessible(l) {
      const rules = unlock.filter((u) => u.lesson_order === l.order_index);
      if (rules.length > 0) {
        return rules.every((u) => skillRequirementsMet(u.requires, skills));
      }
      if (l.order_index <= 1) return true;
      const prev = sorted.find((x) => x.order_index === l.order_index - 1);
      return prev ? doneIds.has(prev.id) : false;
    }

    let seenCurrent = false;
    const lessons = sorted.map((l) => {
      const isDone = doneIds.has(l.id);
      const accessible = isLessonAccessible(l);

      let status = 'locked';
      if (!accessible) status = 'locked';
      else if (isDone) status = 'completed';
      else if (!seenCurrent) {
        status = 'current';
        seenCurrent = true;
      } else status = 'available';

      const showContent = isDone || accessible;
      const dto = lessonDto(l);
      const skillId = dto.meta?.skill ?? 'focus';

      return {
        id: dto.id,
        title: dto.title,
        description: dto.description,
        xp_reward: dto.xp_reward,
        order_index: dto.order_index,
        meta: dto.meta,
        status,
        skill_percent: skills[skillId] ?? 0,
        steps: showContent ? l.steps : [],
        daily_task: showContent ? l.daily_task : null,
      };
    });

    res.json({
      module: { id: module.id, title: module.title },
      skills_snapshot: skills,
      lessons,
    });
  } catch (err) {
    console.error('❌ Ошибка /lessons/module/:id:', err);
    res.status(500).json({ error: 'Ошибка при получении уроков модуля' });
  }
});

router.get('/by-skill/:skillKey', async (req, res) => {
  try {
    const skillKey = req.params.skillKey;
    if (!['focus', 'sit', 'recall'].includes(skillKey)) {
      return res.status(400).json({ error: 'unknown skill' });
    }
    const userId = req.user.id;
    const petId = await getPetIdForUser(userId);

    const [lessons, doneReports] = await Promise.all([
      prisma.lesson.findMany({
        where: { is_active: true, module: { is_active: true, course: { is_active: true } } },
        include: {
          module: {
            select: {
              id: true,
              title: true,
              order_index: true,
              course: { select: { id: true, title: true } },
            },
          },
        },
        orderBy: [
          { module: { course: { id: 'asc' } } },
          { module: { order_index: 'asc' } },
          { order_index: 'asc' },
        ],
      }),
      prisma.dailyReport.findMany({
        where: { pet_id: petId },
        select: { lesson_id: true },
      }),
    ]);

    const doneIds = new Set(doneReports.map((r) => r.lesson_id));
    let firstUndoneSeen = false;

    const items = lessons
      .map((l) => ({ ...l, _meta: parseLessonMeta(l.meta) ?? {} }))
      .filter((l) => (l._meta.skill ?? 'focus') === skillKey)
      .map((l) => {
        const isDone = doneIds.has(l.id);
        let status = 'available';
        if (isDone) {
          status = 'completed';
        } else if (!firstUndoneSeen) {
          status = 'current';
          firstUndoneSeen = true;
        }
        return {
          id: l.id,
          title: l.title,
          order_index: l.order_index,
          xp_reward: l.xp_reward,
          status,
          course: l.module.course,
          module: { id: l.module.id, title: l.module.title },
        };
      });

    res.json({ skill: skillKey, lessons: items });
  } catch (err) {
    console.error('❌ Ошибка /lessons/by-skill/:skillKey:', err);
    res.status(500).json({ error: 'Ошибка при получении уроков по навыку' });
  }
});

router.get('/:lessonId', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.lessonId, 10);
    const userId = req.user.id;
    const petId = await getPetIdForUser(userId);

    const [lesson, report, progress] = await Promise.all([
      prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          steps: { orderBy: { order_index: 'asc' } },
          daily_task: { include: { steps: { orderBy: { order_index: 'asc' } } } },
          module: { include: { course: { select: { id: true, title: true } } } },
        },
      }),
      prisma.dailyReport.findUnique({
        where: { pet_id_lesson_id: { pet_id: petId, lesson_id: lessonId } },
      }),
      prisma.lessonProgress.findUnique({
        where: { pet_id_lesson_id: { pet_id: petId, lesson_id: lessonId } },
      }),
    ]);

    if (!lesson) return res.status(404).json({ error: 'Урок не найден' });

    trackEvent('lesson.opened', { user_id: userId, lesson_id: lessonId });

    const lessonJson = lessonDto(lesson);
    ensureFallbackTreeOnLesson(lessonJson);

    res.json({
      lesson: lessonJson,
      report: report ?? null,
      progress: progress
        ? {
            state: progress.state,
            theory_seen_at: progress.theory_seen_at,
            repeats_count: progress.repeats_count,
            last_repeat_at: progress.last_repeat_at,
            attempts_at_level: parseAttemptsAtLevel(progress.attempts_at_level),
          }
        : {
            state: 'not_started',
            theory_seen_at: null,
            repeats_count: 0,
            last_repeat_at: null,
            attempts_at_level: parseAttemptsAtLevel(null),
          },
    });
  } catch (err) {
    console.error('❌ Ошибка /lessons/:id:', err);
    res.status(500).json({ error: 'Ошибка при получении урока' });
  }
});

// Отметить теорию пройденной
router.post('/:lessonId/theory-seen', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.lessonId, 10);
    const userId = req.user.id;
    const petId = await getPetIdForUser(userId);
    const now = new Date();

    const progress = await prisma.lessonProgress.upsert({
      where: { pet_id_lesson_id: { pet_id: petId, lesson_id: lessonId } },
      update: {
        state: 'theory_done',
        theory_seen_at: now,
        updated_at: now,
      },
      create: {
        user_id: userId,
        pet_id: petId,
        lesson_id: lessonId,
        state: 'theory_done',
        theory_seen_at: now,
      },
    });

    trackEvent('lesson.theory_seen', { user_id: userId, lesson_id: lessonId });
    res.json({ state: progress.state, theory_seen_at: progress.theory_seen_at });
  } catch (err) {
    console.error('❌ Ошибка POST /lessons/:id/theory-seen:', err);
    res.status(500).json({ error: 'Ошибка при сохранении прогресса теории' });
  }
});

// Начать задание (требует пройденной теории)
router.post('/:lessonId/start-task', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.lessonId, 10);
    const userId = req.user.id;
    const petId = await getPetIdForUser(userId);

    const progress = await prisma.lessonProgress.findUnique({
      where: { pet_id_lesson_id: { pet_id: petId, lesson_id: lessonId } },
    });

    if (!progress || !progress.theory_seen_at) {
      return res.status(403).json({ error: 'Сначала нужно изучить теорию' });
    }

    const updated = await prisma.lessonProgress.update({
      where: { pet_id_lesson_id: { pet_id: petId, lesson_id: lessonId } },
      data: { task_started_at: new Date(), updated_at: new Date() },
    });

    trackEvent('lesson.task_started', { user_id: userId, lesson_id: lessonId });

    res.json({ state: updated.state, task_started_at: updated.task_started_at });
  } catch (err) {
    console.error('❌ Ошибка POST /lessons/:id/start-task:', err);
    res.status(500).json({ error: 'Ошибка при запуске задания' });
  }
});

// Начать повтор завершённого урока (возврат в theory_done, 24ч cooldown)
router.post('/:lessonId/repeat-start', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.lessonId, 10);
    const userId = req.user.id;
    const petId = await getPetIdForUser(userId);

    const existing = await prisma.dailyReport.findUnique({
      where: { pet_id_lesson_id: { pet_id: petId, lesson_id: lessonId } },
    });
    if (!existing) return res.status(400).json({ error: 'Урок ещё не завершён' });

    // Проверяем 24ч cooldown по last_repeat_at или completed_at
    const prevProgress = await prisma.lessonProgress.findUnique({
      where: { pet_id_lesson_id: { pet_id: petId, lesson_id: lessonId } },
    });
    const lastActivity = prevProgress?.last_repeat_at ?? existing.completed_at;
    if (lastActivity) {
      const hoursSince = (Date.now() - new Date(lastActivity).getTime()) / 3_600_000;
      if (hoursSince < 24) {
        const hoursLeft = Math.ceil(24 - hoursSince);
        return res.status(429).json({
          error: 'Cooldown активен',
          hours_left: hoursLeft,
          message: `Повтор доступен через ${hoursLeft} ч.`,
        });
      }
    }

    const now = new Date();
    const progress = await prisma.lessonProgress.upsert({
      where: { pet_id_lesson_id: { pet_id: petId, lesson_id: lessonId } },
      update: { state: 'theory_done', task_started_at: null, last_repeat_at: now, updated_at: now },
      create: {
        user_id: userId,
        pet_id: petId,
        lesson_id: lessonId,
        state: 'theory_done',
        theory_seen_at: now,
        last_repeat_at: now,
      },
    });

    trackEvent('lesson.repeated', { user_id: userId, lesson_id: lessonId });
    res.json({ state: progress.state, message: 'Повтор начат' });
  } catch (err) {
    console.error('❌ Ошибка POST /lessons/:id/repeat-start:', err);
    res.status(500).json({ error: 'Ошибка при запуске повтора' });
  }
});

// Сброс «не получилось» — сразу снова пройти урок (без 24ч cooldown)
router.post('/:lessonId/retry-after-fail', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.lessonId, 10);
    const userId = req.user.id;
    const petId = await getPetIdForUser(userId);

    const report = await prisma.dailyReport.findUnique({
      where: { pet_id_lesson_id: { pet_id: petId, lesson_id: lessonId } },
    });
    if (!report) {
      return res.status(400).json({ error: 'Нет завершённого отчёта по этому уроку' });
    }
    if (report.success !== 'no') {
      return res.status(400).json({
        error: 'Повтор сразу доступен только если в отчёте было «не получилось».',
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.dailyReport.delete({ where: { id: report.id } });
      await tx.lessonProgress.upsert({
        where: { pet_id_lesson_id: { pet_id: petId, lesson_id: lessonId } },
        update: {
          state: 'theory_done',
          completed_at: null,
          task_started_at: null,
          updated_at: new Date(),
        },
        create: {
          user_id: userId,
          pet_id: petId,
          lesson_id: lessonId,
          state: 'theory_done',
          theory_seen_at: new Date(),
        },
      });
    });

    trackEvent('lesson.retry_after_fail', { user_id: userId, lesson_id: lessonId });
    res.json({ ok: true });
  } catch (err) {
    console.error('❌ Ошибка POST /lessons/:id/retry-after-fail:', err);
    res.status(500).json({ error: 'Ошибка при сбросе урока' });
  }
});

// История повторов урока
router.get('/:lessonId/history', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.lessonId, 10);
    const userId = req.user.id;
    const petId = await getPetIdForUser(userId);

    const [report, progress] = await Promise.all([
      prisma.dailyReport.findUnique({
        where: { pet_id_lesson_id: { pet_id: petId, lesson_id: lessonId } },
        select: { completed_at: true, success: true, bones_earned: true },
      }),
      prisma.lessonProgress.findUnique({
        where: { pet_id_lesson_id: { pet_id: petId, lesson_id: lessonId } },
        select: { repeats_count: true, last_repeat_at: true },
      }),
    ]);

    res.json({
      completed: !!report,
      completed_at: report?.completed_at ?? null,
      repeats_count: progress?.repeats_count ?? 0,
      last_repeat_at: progress?.last_repeat_at ?? null,
    });
  } catch (err) {
    console.error('❌ Ошибка GET /lessons/:id/history:', err);
    res.status(500).json({ error: 'Ошибка при получении истории' });
  }
});

router.get('/:lessonId/report', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.lessonId, 10);
    const petId = await getPetIdForUser(req.user.id);
    const report = await prisma.dailyReport.findUnique({
      where: { pet_id_lesson_id: { pet_id: petId, lesson_id: lessonId } },
    });
    res.json(report ?? null);
  } catch (err) {
    console.error('❌ Ошибка GET /lessons/:id/report:', err);
    res.status(500).json({ error: 'Ошибка при получении отчёта' });
  }
});

router.post('/:lessonId/report', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.lessonId, 10);
    const userId = req.user.id;
    const petId = await getPetIdForUser(userId);
    let { steps_data = [], note = '' } = req.body;

    let success = req.body.success;
    const legacyRating = req.body.rating;
    if (!success && legacyRating !== undefined && legacyRating !== null) {
      success = legacyRating >= 3 ? 'yes' : legacyRating === 2 ? 'partial' : 'no';
    }
    if (!success) success = 'yes';
    if (!['yes', 'partial', 'no'].includes(success)) {
      return res.status(400).json({ error: 'success должен быть yes, partial или no' });
    }

    const rating = success === 'yes' ? 3 : success === 'partial' ? 2 : 1;

    const existing = await prisma.dailyReport.findUnique({
      where: { pet_id_lesson_id: { pet_id: petId, lesson_id: lessonId } },
    });
    if (existing) {
      return res.status(409).json({ error: 'Этот урок уже завершён' });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { lessons: { select: { id: true } }, course: { select: { id: true } } } } },
    });
    if (!lesson) return res.status(404).json({ error: 'Урок не найден' });

    const lessonParsed = ensureFallbackTreeOnLesson(lessonDto(lesson));

    let fromTier = parseInt(req.body.from_fallback_tier, 10);
    if (!Number.isFinite(fromTier) || fromTier < 1 || fromTier > 3) fromTier = 1;

    const meta = parseLessonMeta(lesson.meta) ?? {};
    const legacySkill = meta.skill || 'focus';
    const atomicSkillKey = meta.skill_key || legacySkill;
    const progressGain = meta.progress_gain ?? 10;

    const profile = await prisma.profile.findUnique({
      where: { user_id: userId },
      include: { pet: true },
    });
    if (!profile) return res.status(404).json({ error: 'Профиль не найден' });
    const petRow = profile.pet;
    if (!petRow) return res.status(500).json({ error: 'Питомец не привязан к профилю' });

    let prefs = {};
    try {
      prefs = profile.preferences ? JSON.parse(profile.preferences) : {};
    } catch {
      prefs = {};
    }
    prefs.lesson_attempts = prefs.lesson_attempts || {};
    const aid = String(lessonId);
    prefs.lesson_attempts[aid] = prefs.lesson_attempts[aid] || { fail: 0, yes: 0 };
    if (success === 'no') prefs.lesson_attempts[aid].fail += 1;
    if (success === 'yes') prefs.lesson_attempts[aid].yes += 1;

    const attempts = prefs.lesson_attempts[aid];
    const adaptive =
      attempts.fail >= 2 && attempts.yes < 2
        ? { easier: true, hint: 'Попробуй упрощённый вариант из fallback_tasks урока.' }
        : attempts.yes >= 3
          ? { harder: true, hint: 'Можно добавить отвлечения или увеличить время выдержки.' }
          : {};

    const allModuleLessonIds = lesson.module.lessons.map((l) => l.id);
    const doneInModule = await prisma.dailyReport.count({
      where: { pet_id: petId, lesson_id: { in: allModuleLessonIds } },
    });
    const isModuleComplete = doneInModule + 1 >= allModuleLessonIds.length;

    const hasData = steps_data.some(
      (s) => s.value !== null && s.value !== '' && s.value !== false && s.value !== 0
    );

    const streakForBonus = petRow.streak ?? 0;

    const xpEarned = calculateLessonReportXP(
      lesson.xp_reward,
      success,
      hasData,
      streakForBonus,
      isModuleComplete
    );

    const coinsGain = Math.floor(xpEarned / 2);
    const oldXP = petRow.experience ?? 0;
    const newXP = oldXP + xpEarned;
    const oldLevel = getLevelByXP(oldXP);
    const newLevelObj = getLevelByXP(newXP);

    const newSkillsJson = applySkillDelta(petRow.skills_json, legacySkill, success, progressGain);

    const txResult = await prisma.$transaction(async (tx) => {
      const created = await tx.dailyReport.create({
        data: {
          user_id: userId,
          pet_id: petId,
          lesson_id: lessonId,
          steps_data: JSON.stringify(steps_data),
          rating,
          success,
          note: note || null,
          xp_earned: xpEarned,
          bones_earned: 0,
        },
      });

      const lp = await tx.lessonProgress.findUnique({
        where: { pet_id_lesson_id: { pet_id: petId, lesson_id: lessonId } },
      });
      let attemptsFin = parseAttemptsAtLevel(lp?.attempts_at_level);
      if (success === 'no') {
        attemptsFin = mergeNoAttempt(lp?.attempts_at_level, fromTier);
      }
      const attemptsStr = JSON.stringify(attemptsFin);

      await tx.pet.update({
        where: { id: petId },
        data: {
          experience: newXP,
          coins: (petRow.coins ?? 0) + coinsGain,
          skills_json: newSkillsJson,
          level: newLevelObj.level,
        },
      });

      await tx.profile.update({
        where: { user_id: userId },
        data: { preferences: JSON.stringify(prefs) },
      });

      await tx.lessonProgress.upsert({
        where: { pet_id_lesson_id: { pet_id: petId, lesson_id: lessonId } },
        update: {
          state: 'completed',
          completed_at: new Date(),
          updated_at: new Date(),
          attempts_at_level: attemptsStr,
        },
        create: {
          user_id: userId,
          pet_id: petId,
          lesson_id: lessonId,
          state: 'completed',
          theory_seen_at: new Date(),
          task_started_at: new Date(),
          completed_at: new Date(),
          attempts_at_level: attemptsStr,
        },
      });

      return { created, attemptsFin };
    });

    const report = txResult.created;
    const attemptsAtLevelOut = txResult.attemptsFin;

    const newStreak = await updateStreakAfterLessonReport(
      userId,
      report.completed_at,
      success,
      report.id
    );

    // Начислить косточку если не «нет»
    let bonesResult = { bones_earned: 0 };
    if (success !== 'no') {
      bonesResult = await awardBone(prisma, userId, atomicSkillKey, { streakCount: newStreak ?? 0 });
      await prisma.dailyReport.update({
        where: { id: report.id },
        data: { bones_earned: bonesResult.bones_earned },
      });
    }

    const newAchievements = await checkAndAwardAchievements(userId);

    if (success === 'no') {
      trackEvent('lesson.failed', {
        user_id: userId,
        lesson_id: lessonId,
        xp_earned: xpEarned,
      });
    } else {
      trackEvent('lesson.completed', {
        user_id: userId,
        lesson_id: lessonId,
        success,
        xp_earned: xpEarned,
      });
    }
    if (success !== 'no' && bonesResult.bones_earned > 0) {
      trackEvent('bone.awarded', {
        user_id: userId,
        lesson_id: lessonId,
        skill_key: atomicSkillKey,
        bones: bonesResult.bones_earned,
      });
    }

    let emotional_reward = null;
    if (success !== 'no') {
      const [skillRow, petSnap] = await Promise.all([
        prisma.skill.findUnique({ where: { key: atomicSkillKey } }),
        prisma.pet.findUnique({
          where: { id: petId },
          select: { name: true },
        }),
      ]);
      const curBones = bonesResult.bones_json?.[atomicSkillKey] ?? 0;
      emotional_reward = {
        pet_name: petSnap?.name ?? profile.pet_name ?? 'Ваш питомец',
        atomic_outcome: skillRow?.atomic_outcome ?? null,
        skill_title: skillRow?.title ?? atomicSkillKey,
        skill_bones_current: curBones,
        skill_bones_target: skillRow?.target_bones ?? 5,
      };
    }

    const feedback =
      success === 'yes'
        ? meta.success_message
        : success === 'partial'
          ? meta.partial_message
          : meta.fail_message;

    res.status(201).json({
      outcome: success,
      report,
      xp_earned: xpEarned,
      total_xp: newXP,
      level: newLevelObj,
      level_up: newLevelObj.level > oldLevel.level,
      streak: newStreak,
      coins_earned: coinsGain,
      coins_total: (petRow.coins ?? 0) + coinsGain,
      skills: JSON.parse(newSkillsJson),
      skill_key: atomicSkillKey,
      legacy_skill: legacySkill,
      module_complete: isModuleComplete,
      achievements_unlocked: newAchievements,
      feedback_message: feedback,
      fallback_tasks: success === 'no' ? meta.fallback_tasks ?? [] : [],
      fallback_tree: success === 'no' ? lessonParsed.fallback_tree ?? null : null,
      attempts_at_level: attemptsAtLevelOut,
      adaptive,
      bones_earned: bonesResult.bones_earned,
      bones_total: bonesResult.new_total ?? null,
      bones_stage: bonesResult.new_stage ?? null,
      is_special_bone: bonesResult.is_special ?? false,
      emotional_reward: emotional_reward,
    });
  } catch (err) {
    console.error('❌ Ошибка POST /lessons/:id/report:', err);
    res.status(500).json({ error: 'Ошибка при сохранении отчёта' });
  }
});

router.post('/:lessonId/video', handleTrophyVideoUpload, async (req, res) => {
  try {
    const lessonId = parseInt(req.params.lessonId, 10);
    const userId = req.user.id;
    const petId = await getPetIdForUser(userId);
    if (!Number.isFinite(lessonId)) {
      return res.status(400).json({ error: 'Некорректный урок' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Прикрепите поле video' });
    }

    const done = await prisma.dailyReport.findUnique({
      where: { pet_id_lesson_id: { pet_id: petId, lesson_id: lessonId } },
    });
    if (!done) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {
        /* ignore */
      }
      return res.status(403).json({ error: 'Сначала завершите урок' });
    }

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {
        /* ignore */
      }
      return res.status(404).json({ error: 'Урок не найден' });
    }

    const meta = parseLessonMeta(lesson.meta) ?? {};
    const skillKey = meta.skill_key || meta.skill || 'general';

    const skill = await prisma.skill.findUnique({ where: { key: skillKey } });
    const snapshot = skill?.atomic_outcome ?? null;

    const existing = await prisma.userTrophyVideo.findFirst({
      where: { user_id: userId, lesson_id: lessonId },
    });
    if (existing) {
      const oldPath = path.join(__dirname, '../../public/user-videos', existing.storage_key);
      try {
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      } catch {
        /* ignore */
      }
      await prisma.userTrophyVideo.delete({ where: { id: existing.id } });
    }

    const row = await prisma.userTrophyVideo.create({
      data: {
        user_id: userId,
        lesson_id: lessonId,
        skill_key: skillKey,
        storage_key: req.file.filename,
        mime_type: req.file.mimetype,
        size_bytes: req.file.size,
        atomic_outcome_snapshot: snapshot,
      },
    });

    res.status(201).json({
      ok: true,
      video: {
        id: row.id,
        lesson_id: row.lesson_id,
        skill_key: row.skill_key,
        atomic_outcome_snapshot: row.atomic_outcome_snapshot,
        created_at: row.created_at,
      },
    });
  } catch (err) {
    console.error('❌ Ошибка POST /lessons/:id/video:', err);
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {
        /* ignore */
      }
    }
    res.status(500).json({ error: 'Не удалось сохранить видео' });
  }
});

module.exports = router;
