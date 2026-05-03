const express = require('express');
const { prisma } = require('../database/connection');
const { parseBones } = require('../utils/bones');
const { trackEvent } = require('../utils/analytics');
const { isUserProEffective } = require('../utils/tier');
const { getPetIdForUser } = require('../utils/petContext');

const router = express.Router();

function parsePrefs(raw) {
  try {
    const o = raw ? JSON.parse(raw) : {};
    return o && typeof o === 'object' && !Array.isArray(o) ? o : {};
  } catch {
    return {};
  }
}

// GET /api/routes — все маршруты + прогресс по атомам пользователя
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const petId = await getPetIdForUser(userId);

    const [routes, profile, pet, userRow] = await Promise.all([
      prisma.route.findMany({
        include: {
          skills: {
            orderBy: { order_index: 'asc' },
            include: {
              skill: { select: { key: true, title: true, category_key: true } },
            },
          },
        },
        orderBy: { order_index: 'asc' },
      }),
      prisma.profile.findUnique({ where: { user_id: userId }, select: { preferences: true } }),
      prisma.pet.findUnique({ where: { id: petId }, select: { bones_json: true } }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { tier: true, tier_expires_at: true },
      }),
    ]);

    const bones = parseBones(pet?.bones_json);
    const prefs = parsePrefs(profile?.preferences);
    const selectedRouteKey = prefs.selected_route_key ?? null;
    const routePaused = prefs.route_paused === true;

    const result = routes.map((route) => {
      const skills = route.skills.map((rs) => {
        const bonesEarned = bones[rs.skill_key] ?? 0;
        return {
          skill_key: rs.skill_key,
          skill_title: rs.skill?.title ?? rs.skill_key,
          category_key: rs.skill?.category_key ?? null,
          order_index: rs.order_index,
          is_required: rs.is_required,
          bones_earned: bonesEarned,
        };
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
        requires_pro:   route.requires_pro === true,
        skills,
        progress_pct:   progressPct,
        is_selected:    route.key === selectedRouteKey,
      };
    });

    res.json({
      routes: result,
      route_paused: routePaused,
      is_pro: isUserProEffective(userRow),
    });
  } catch (err) {
    console.error('❌ GET /api/routes:', err);
    res.status(500).json({ error: 'Ошибка при получении маршрутов' });
  }
});

// POST /api/routes/pause — до :key, иначе «pause» попадёт в select
router.post('/pause', async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await prisma.profile.findUnique({ where: { user_id: userId }, select: { preferences: true } });
    const prefs = parsePrefs(profile?.preferences);
    if (!prefs.selected_route_key) {
      return res.status(400).json({ error: 'Сначала выберите маршрут' });
    }
    prefs.route_paused = true;
    await prisma.profile.update({
      where: { user_id: userId },
      data: { preferences: JSON.stringify(prefs) },
    });
    res.json({ route_paused: true });
  } catch (err) {
    console.error('❌ POST /api/routes/pause:', err);
    res.status(500).json({ error: 'Ошибка при постановке на паузу' });
  }
});

router.post('/resume', async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await prisma.profile.findUnique({ where: { user_id: userId }, select: { preferences: true } });
    const prefs = parsePrefs(profile?.preferences);
    prefs.route_paused = false;
    await prisma.profile.update({
      where: { user_id: userId },
      data: { preferences: JSON.stringify(prefs) },
    });
    res.json({ route_paused: false });
  } catch (err) {
    console.error('❌ POST /api/routes/resume:', err);
    res.status(500).json({ error: 'Ошибка при возобновлении' });
  }
});

// POST /api/routes/:key/select — выбрать/сменить маршрут
router.post('/:key/select', async (req, res) => {
  try {
    const routeKey = req.params.key;
    const userId = req.user.id;

    const [route, userRow] = await Promise.all([
      prisma.route.findUnique({ where: { key: routeKey } }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { tier: true, tier_expires_at: true },
      }),
    ]);
    if (!route) return res.status(404).json({ error: 'Маршрут не найден' });

    if (route.requires_pro && !isUserProEffective(userRow)) {
      return res.status(403).json({
        error: 'Этот маршрут доступен в подписке Pro (Telegram Stars).',
        code: 'PRO_REQUIRED',
      });
    }

    const profile = await prisma.profile.findUnique({ where: { user_id: userId }, select: { preferences: true } });
    const prefs = parsePrefs(profile?.preferences);
    prefs.selected_route_key = routeKey;
    prefs.route_paused = false;

    await prisma.profile.update({
      where: { user_id: userId },
      data: { preferences: JSON.stringify(prefs) },
    });

    trackEvent('route.started', { user_id: userId, route_key: routeKey });
    res.json({ selected_route_key: routeKey });
  } catch (err) {
    console.error('❌ POST /api/routes/:key/select:', err);
    res.status(500).json({ error: 'Ошибка при выборе маршрута' });
  }
});

module.exports = router;
