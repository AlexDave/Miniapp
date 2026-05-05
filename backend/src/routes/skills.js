const express = require('express');
const { prisma } = require('../database/connection');
const { parseBones } = require('../utils/bones');
const { lessonMatchesSkill } = require('../utils/lessonSkillMeta');
const { getPetIdForUser } = require('../utils/petContext');

const router = express.Router();

// Вычислить прогресс атома (0–100%) по косточкам
function skillProgress(bonesForSkill = 0, targetBones = 5) {
  return Math.min(100, Math.round((bonesForSkill / targetBones) * 100));
}

// Проверить, разблокирован ли навык (soft = рекомендация, не блокировка)
function isRecommended(skill, bonesBySkill = {}, skillTitleByKey = new Map()) {
  const empty = { locked: false, hint: null, hint_skill_key: null, hint_skill_title: null };
  if (!skill.unlock_rules) return empty;
  try {
    const rules = JSON.parse(skill.unlock_rules);
    const soft = rules.soft ?? [];
    const unmet = soft.filter((r) => (bonesBySkill[r.skill] ?? 0) < r.min);
    if (unmet.length === 0) return empty;
    const first = unmet[0];
    const key = first.skill;
    const label = skillTitleByKey.get(key) ?? key;
    return {
      locked: false,
      hint: `Рекомендуем сначала: «${label}»`,
      hint_skill_key: key,
      hint_skill_title: label,
    };
  } catch {
    return empty;
  }
}

// GET /api/skills/tree — все категории с атомами и прогрессом
router.get('/tree', async (req, res) => {
  try {
    const userId = req.user.id;
    const petId = await getPetIdForUser(userId);

    const [categories, pet] = await Promise.all([
      prisma.skillCategory.findMany({
        include: { skills: { orderBy: { order_index: 'asc' } } },
        orderBy: { order_index: 'asc' },
      }),
      prisma.pet.findUnique({ where: { id: petId }, select: { bones_json: true } }),
    ]);

    const bones = parseBones(pet?.bones_json);

    const skillTitleByKey = new Map();
    for (const cat of categories) {
      for (const s of cat.skills) {
        skillTitleByKey.set(s.key, s.title);
      }
    }

    const tree = categories.map((cat) => {
      const skillsWithProgress = cat.skills.map((skill) => {
        const bonesEarned = bones[skill.key] ?? 0;
        const pct = skillProgress(bonesEarned, skill.target_bones);
        const { locked, hint, hint_skill_key, hint_skill_title } = isRecommended(
          skill,
          bones,
          skillTitleByKey
        );
        return {
          key:          skill.key,
          title:        skill.title,
          description:  skill.description,
          order_index:  skill.order_index,
          target_bones: skill.target_bones,
          atomic_outcome: skill.atomic_outcome ?? null,
          bones_earned: bonesEarned,
          progress_pct: pct,
          is_complete:  pct >= 100,
          locked,
          unlock_hint:  hint,
          unlock_hint_skill_key: hint_skill_key,
          unlock_hint_skill_title: hint_skill_title,
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
    const petId = await getPetIdForUser(userId);

    const [lessons, doneReports, progress] = await Promise.all([
      prisma.lesson.findMany({
        where: { is_active: true },
        include: {
          module: { include: { course: { select: { id: true, title: true } } } },
          reports: { where: { pet_id: petId }, select: { id: true, success: true } },
        },
        orderBy: [
          { module: { course: { id: 'asc' } } },
          { module: { order_index: 'asc' } },
          { order_index: 'asc' },
        ],
      }),
      prisma.dailyReport.findMany({ where: { pet_id: petId }, select: { lesson_id: true } }),
      prisma.lessonProgress.findMany({ where: { pet_id: petId }, select: { lesson_id: true, repeats_count: true } }),
    ]);

    const doneIds = new Set(doneReports.map((r) => r.lesson_id));
    const progressMap = Object.fromEntries(progress.map((p) => [p.lesson_id, p.repeats_count]));

    const filtered = lessons.filter((l) => lessonMatchesSkill(l.meta, skillKey));

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
