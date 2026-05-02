const express = require('express');
const { prisma } = require('../database/connection');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [all, earned] = await Promise.all([
      prisma.achievement.findMany({ where: { is_active: true }, orderBy: { id: 'asc' } }),
      prisma.userAchievement.findMany({ where: { user_id: req.user.id } }),
    ]);

    const earnedIds = new Set(earned.map((ua) => ua.achievement_id));

    const result = all.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      icon: a.icon,
      color: a.color,
      earned: earnedIds.has(a.id),
      earned_at: earned.find((ua) => ua.achievement_id === a.id)?.earned_at ?? null,
    }));

    res.json(result);
  } catch (err) {
    logger.error({ err }, 'Ошибка при получении достижений');
    res.status(500).json({ error: 'Ошибка при получении достижений' });
  }
});

module.exports = router;
