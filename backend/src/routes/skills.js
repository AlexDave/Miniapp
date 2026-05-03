const express = require('express');
const { prisma } = require('../database/connection');
const { parseBones } = require('../utils/bones');

const router = express.Router();

// Вычислить прогресс атома (0–100%) по косточкам
function skillProgress(bonesForSkill = 0, targetBones = 5) {
  return Math.min(100, Math.round((bonesForSkill / targetBones) * 100));
}

// Проверить, разблокирован ли навык (soft = рекомендация, не блокировка)
function isRecommended(skill, bonesBySkill = {}) {
  if (!skill.unlock_rules) return { locked: false, hint: null };
  try {
    const rules = JSON.parse(skill.unlock_rules);
    const soft = rules.soft ?? [];
    const unmet = soft.filter((r) => (bonesBySkill[r.skill] ?? 0) < r.min);
    if (unmet.length === 0) return { locked: false, hint: null };
    const first = unmet[0];
    return { locked: false, hint: `Рекомендуем сначала: «${first.skill}»` };
  } catch {
    return { locked: false, hint: null };
  }
}

// GET /api/skills/tree — все категории с атомами и прогрессом
router.get('/tree', async (req, res) => {
  try {
    const userId = req.user.id;

    const [categories, profile] = await Promise.all([
      prisma.skillCategory.findMany({
        include: { skills: { orderBy: { order_index: 'asc' } } },
        orderBy: { order_index: 'asc' },
      }),
      prisma.profile.findUnique({ where: { user_id: userId }, select: { bones_json: true } }),
    ]);

    const bones = parseBones(profile?.bones_json);

    const tree = categories.map((cat) => {
      const skillsWithProgress = cat.skills.map((skill) => {
        const bonesEarned = bones[skill.key] ?? 0;
        const pct = skillProgress(bonesEarned, skill.target_bones);
        const { locked, hint } = isRecommended(skill, bones);
        return {
          key:          skill.key,
          title:        skill.title,
          description:  skill.description,
          order_index:  skill.order_index,
          target_bones: skill.target_bones,
          bones_earned: bonesEarned,
          progress_pct: pct,
          is_complete:  pct >= 100,
          locked,
          unlock_hint:  hint,
        };
      });

      const totalPct = skillsWithProgress.length > 0
        ? Math.round(skillsWithProgress.reduce((s, x) => s + x.progress_pct, 0) / skillsWithProgress.length)
        : 0;

      return {
        key:         cat.key,
        title:       cat.title,
        description: cat.description,
        icon:        cat.icon,
        order_index: cat.order_index,
        progress_pct: totalPct,
        skills:      skillsWithProgress,
      };
    });

    res.json(tree);
  } catch (err) {
    console.error('❌ Ошибка GET /api/skills/tree:', err);
    res.status(500).json({ error: 'Ошибка при получении дерева навыков' });
  }
});

// GET /api/skills/:key/lessons — уроки атома (по meta.skill)
router.get('/:key/lessons', async (req, res) => {
  try {
    const skillKey = req.params.key;
    const userId = req.user.id;

    const [lessons, doneReports, progress] = await Promise.all([
      prisma.lesson.findMany({
        where: { is_active: true },
        include: {
          module: { include: { course: { select: { id: true, title: true } } } },
          reports: { where: { user_id: userId }, select: { id: true, success: true } },
        },
        orderBy: [
          { module: { course: { id: 'asc' } } },
          { module: { order_index: 'asc' } },
          { order_index: 'asc' },
        ],
      }),
      prisma.dailyReport.findMany({ where: { user_id: userId }, select: { lesson_id: true } }),
      prisma.lessonProgress.findMany({ where: { user_id: userId }, select: { lesson_id: true, repeats_count: true } }),
    ]);

    const doneIds = new Set(doneReports.map((r) => r.lesson_id));
    const progressMap = Object.fromEntries(progress.map((p) => [p.lesson_id, p.repeats_count]));

    // Фильтруем по skill_key из meta
    const filtered = lessons.filter((l) => {
      try {
        const meta = l.meta ? (typeof l.meta === 'string' ? JSON.parse(l.meta) : l.meta) : {};
        if (meta.skill_key && meta.skill_key === skillKey) return true;
        const sk = meta.skill ?? 'focus';
        const keyMap = { focus: 'intro.eye', sit: 'control.sit', recall: 'walk.recall' };
        const mappedKey = keyMap[sk] ?? sk;
        return mappedKey === skillKey || sk === skillKey;
      } catch {
        return false;
      }
    });

    let firstUndoneSeen = false;
    const result = filtered.map((l) => {
      const isDone = doneIds.has(l.id);
      let status = 'available';
      if (isDone) status = 'completed';
      else if (!firstUndoneSeen) { status = 'current'; firstUndoneSeen = true; }
      return {
        id: l.id,
        title: l.title,
        order_index: l.order_index,
        xp_reward: l.xp_reward,
        status,
        repeats_count: progressMap[l.id] ?? 0,
        course: l.module.course,
        module: { id: l.module.id, title: l.module.title },
      };
    });

    res.json({ skill_key: skillKey, lessons: result });
  } catch (err) {
    console.error('❌ Ошибка GET /api/skills/:key/lessons:', err);
    res.status(500).json({ error: 'Ошибка при получении уроков навыка' });
  }
});

module.exports = router;
