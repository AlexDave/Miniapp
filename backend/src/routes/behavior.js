const express = require('express');
const { prisma } = require('../database/connection');
const logger = require('../utils/logger');
const { trackEvent } = require('../utils/analytics');
const { suggestionForType, skillTitle, typeLabelRu } = require('../utils/behaviorSuggestions');

const router = express.Router();

const BEHAVIOR_TYPES = ['barking', 'accident', 'escape', 'aggression', 'chewing', 'other'];

function eventDto(e, extra = {}) {
  const sug = suggestionForType(e.type);
  return {
    id: e.id,
    type: e.type,
    note: e.note,
    severity: e.severity,
    created_at: e.created_at,
    suggested_skill_key: sug.skill_key,
    suggested_skill_title: skillTitle(sug.skill_key),
    ...extra,
  };
}

async function countTypeInRange(userId, type, from, to) {
  return prisma.behaviorEvent.count({
    where: {
      user_id: userId,
      type,
      created_at: { gte: from, lt: to },
    },
  });
}

async function buildTrendStats(userId) {
  const now = Date.now();
  const t0 = new Date(now);
  const t7 = new Date(now - 7 * 86400000);
  const t14 = new Date(now - 14 * 86400000);
  const types = BEHAVIOR_TYPES.filter((x) => x !== 'other');
  const rows = await Promise.all(
    types.map(async (type) => {
      const [last7, prev7] = await Promise.all([
        countTypeInRange(userId, type, t7, t0),
        countTypeInRange(userId, type, t14, t7),
      ]);
      let delta_pct = null;
      if (prev7 > 0) delta_pct = Math.round((1 - last7 / prev7) * 100);
      else if (prev7 === 0 && last7 > 0) delta_pct = -100;
      return { type, label: typeLabelRu(type), last7, prev7, delta_pct };
    })
  );
  const highlights = [];
  for (const t of rows) {
    if (t.prev7 >= 2 && t.delta_pct != null && t.delta_pct >= 30) {
      highlights.push(`${t.label} ↓ на ${t.delta_pct}% за 2 недели (сравнение 7+7 дней).`);
    }
  }
  return { trends: rows, highlights };
}

router.post('/log', async (req, res) => {
  try {
    const { type, note = null } = req.body;
    let { severity = 2 } = req.body;

    if (!BEHAVIOR_TYPES.includes(type)) {
      return res.status(400).json({ error: `type должен быть одним из: ${BEHAVIOR_TYPES.join(', ')}` });
    }
    severity = Math.min(5, Math.max(1, parseInt(String(severity), 10) || 2));

    const ev = await prisma.behaviorEvent.create({
      data: {
        user_id: req.user.id,
        type,
        note: note && String(note).trim() ? String(note).trim().slice(0, 2000) : null,
        severity,
      },
    });

    const since7 = new Date(Date.now() - 7 * 86400000);
    const sameTypeWeekCount = await prisma.behaviorEvent.count({
      where: { user_id: req.user.id, type, created_at: { gte: since7 } },
    });

    const sug = suggestionForType(type);
    const suggested_skill_title = skillTitle(sug.skill_key);

    let suggestion_message = null;
    if (sameTypeWeekCount >= 3) {
      const lab = typeLabelRu(type);
      suggestion_message = `У вас ${sameTypeWeekCount} случая «${lab}» за неделю — попробуйте навык «${suggested_skill_title}».`;
    }

    trackEvent('behavior.logged', { user_id: req.user.id, type, severity });

    res.status(201).json({
      event: eventDto(ev),
      suggested_skill_key: sug.skill_key,
      suggested_skill_title,
      same_type_week_count: sameTypeWeekCount,
      suggestion_message,
    });
  } catch (err) {
    logger.error({ err }, 'POST /behavior/log');
    res.status(500).json({ error: 'Не удалось сохранить инцидент' });
  }
});

router.get('/', async (req, res) => {
  try {
    const days = Math.min(90, Math.max(1, parseInt(String(req.query.days), 10) || 30));
    const since = new Date(Date.now() - days * 86400000);

    const [events, stats] = await Promise.all([
      prisma.behaviorEvent.findMany({
        where: { user_id: req.user.id, created_at: { gte: since } },
        orderBy: { created_at: 'desc' },
        take: 300,
      }),
      buildTrendStats(req.user.id),
    ]);

    res.json({
      events: events.map((e) => eventDto(e)),
      stats,
    });
  } catch (err) {
    logger.error({ err }, 'GET /behavior');
    res.status(500).json({ error: 'Не удалось загрузить журнал' });
  }
});

module.exports = router;
