const express = require('express');
const { prisma } = require('../database/connection');
const { parseBones } = require('../utils/bones');

const router = express.Router();

// GET /api/routes — все маршруты + прогресс по атомам пользователя
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const [routes, profile] = await Promise.all([
      prisma.route.findMany({
        include: { skills: { orderBy: { order_index: 'asc' } } },
        orderBy: { order_index: 'asc' },
      }),
      prisma.profile.findUnique({ where: { user_id: userId }, select: { bones_json: true, preferences: true } }),
    ]);

    const bones = parseBones(profile?.bones_json);

    let selectedRouteKey = null;
    try {
      const prefs = profile?.preferences ? JSON.parse(profile.preferences) : {};
      selectedRouteKey = prefs.selected_route_key ?? null;
    } catch { /* */ }

    const result = routes.map((route) => {
      const skills = route.skills.map((rs) => {
        const bonesEarned = bones[rs.skill_key] ?? 0;
        return { skill_key: rs.skill_key, order_index: rs.order_index, is_required: rs.is_required, bones_earned: bonesEarned };
      });
      const totalRequired = skills.filter((s) => s.is_required).length;
      const doneRequired = skills.filter((s) => s.is_required && s.bones_earned > 0).length;
      const progressPct = totalRequired > 0 ? Math.round((doneRequired / totalRequired) * 100) : 0;

      return {
        id:             route.id,
        key:            route.key,
        title:          route.title,
        description:    route.description,
        icon:           route.icon,
        target_problem: route.target_problem,
        age_min_months: route.age_min_months,
        age_max_months: route.age_max_months,
        order_index:    route.order_index,
        skills,
        progress_pct:   progressPct,
        is_selected:    route.key === selectedRouteKey,
      };
    });

    res.json(result);
  } catch (err) {
    console.error('❌ GET /api/routes:', err);
    res.status(500).json({ error: 'Ошибка при получении маршрутов' });
  }
});

// POST /api/routes/:key/select — выбрать/сменить маршрут
router.post('/:key/select', async (req, res) => {
  try {
    const routeKey = req.params.key;
    const userId = req.user.id;

    const route = await prisma.route.findUnique({ where: { key: routeKey } });
    if (!route) return res.status(404).json({ error: 'Маршрут не найден' });

    const profile = await prisma.profile.findUnique({ where: { user_id: userId }, select: { preferences: true } });
    let prefs = {};
    try { prefs = profile?.preferences ? JSON.parse(profile.preferences) : {}; } catch { /* */ }
    prefs.selected_route_key = routeKey;

    await prisma.profile.update({
      where: { user_id: userId },
      data: { preferences: JSON.stringify(prefs) },
    });

    res.json({ selected_route_key: routeKey });
  } catch (err) {
    console.error('❌ POST /api/routes/:key/select:', err);
    res.status(500).json({ error: 'Ошибка при выборе маршрута' });
  }
});

module.exports = router;
