const express = require('express');
const { prisma } = require('../database/connection');
const logger = require('../utils/logger');
const { parsePreferences } = require('../utils/profilePreferences');
const { buildProfileResponse } = require('../utils/profileResponse');
const { routeKeyForAgeBucket, getFirstLessonIdForRoute, DEFAULT_ROUTE } = require('../utils/onboardingRoute');
const { isUserProEffective } = require('../utils/tier');
const { USER_AUX_FOR_PROFILE } = require('../constants/profileUserSelect');
const { trackEvent } = require('../utils/analytics');

const router = express.Router();

const BUCKETS = new Set(['under6mo', '6mo_2y', 'older']);

/**
 * POST /api/onboarding/complete
 * Завершение короткого онбординга: кличка, возраст → маршрут на сервере, первый урок.
 */
router.post('/complete', async (req, res) => {
  const { petName, dog_age_bucket: dogAgeBucket } = req.body ?? {};

  if (!BUCKETS.has(dogAgeBucket)) {
    return res.status(400).json({ error: 'Укажите возраст питомца (dog_age_bucket)' });
  }

  const name = typeof petName === 'string' && petName.trim().length > 0
    ? petName.trim().slice(0, 80)
    : 'Ваш питомец';

  try {
    let routeKey = routeKeyForAgeBucket(dogAgeBucket);
    let route = await prisma.route.findUnique({ where: { key: routeKey } });
    if (!route) {
      logger.error({ routeKey }, 'Маршрут для онбординга не найден в БД');
      return res.status(500).json({ error: 'Конфигурация маршрутов не готова' });
    }

    const [current, userRow] = await Promise.all([
      prisma.profile.findUnique({ where: { user_id: req.user.id } }),
      prisma.user.findUnique({
        where: { id: req.user.id },
        select: { tier: true, tier_expires_at: true },
      }),
    ]);

    if (route.requires_pro && !isUserProEffective(userRow)) {
      routeKey = DEFAULT_ROUTE;
      route = await prisma.route.findUnique({ where: { key: routeKey } });
      if (!route) {
        logger.error({ routeKey }, 'Fallback-маршрут не найден');
        return res.status(500).json({ error: 'Конфигурация маршрутов не готова' });
      }
    }

    const firstLessonId = await getFirstLessonIdForRoute(routeKey);

    if (!current) {
      return res.status(404).json({ error: 'Профиль не найден' });
    }

    const prefs = parsePreferences(current.preferences);
    prefs.onboarding_completed = true;
    prefs.dog_age_bucket = dogAgeBucket;
    prefs.selected_route_key = routeKey;
    prefs.route_paused = false;
    prefs.learning_goals = [];
    prefs.primary_problem = null;

    const profile = await prisma.profile.update({
      where: { user_id: req.user.id },
      data: {
        pet_name: name,
        preferences: JSON.stringify(prefs),
      },
    });

    if (profile.pet_id) {
      await prisma.pet.update({ where: { id: profile.pet_id }, data: { name } });
    }

    trackEvent('onboarding.complete', {
      user_id: req.user.id,
      route_key: routeKey,
      dog_age_bucket: dogAgeBucket,
      first_lesson_id: firstLessonId,
    });

    const [userForJson, pet] = await Promise.all([
      prisma.user.findUnique({
        where: { id: req.user.id },
        select: USER_AUX_FOR_PROFILE,
      }),
      profile.pet_id ? prisma.pet.findUnique({ where: { id: profile.pet_id } }) : null,
    ]);

    res.json({
      profile: buildProfileResponse(profile, userForJson, pet),
      route_key: routeKey,
      first_lesson_id: firstLessonId,
    });
  } catch (err) {
    logger.error({ err }, 'Ошибка POST /api/onboarding/complete');
    res.status(500).json({ error: 'Не удалось завершить онбординг' });
  }
});

module.exports = router;
