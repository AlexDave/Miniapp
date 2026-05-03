const express = require('express');
const { prisma } = require('../database/connection');

const router = express.Router();

function adminGuard(req, res, next) {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) {
    return res.status(503).json({ error: 'ADMIN_API_KEY не задан в окружении' });
  }
  const got = req.headers['x-admin-key'];
  if (got !== expected) {
    return res.status(401).json({ error: 'Неверный или отсутствует заголовок X-Admin-Key' });
  }
  next();
}

/**
 * GET /api/admin/funnel
 * Воронка: пользователи → онбординг → хотя бы один урок → серия 7+ дней.
 */
router.get('/funnel', adminGuard, async (req, res) => {
  try {
    const [userCount, profiles] = await Promise.all([
      prisma.user.count(),
      prisma.profile.findMany({
        select: { preferences: true, streak: true },
      }),
    ]);

    let onboardingDone = 0;
    for (const p of profiles) {
      try {
        const o = JSON.parse(p.preferences || '{}');
        if (o.onboarding_completed === true) onboardingDone++;
      } catch {
        /* ignore */
      }
    }

    const distinctLessonUsers = await prisma.dailyReport.groupBy({
      by: ['user_id'],
      _count: { user_id: true },
    });

    const streak7 = profiles.filter((p) => (p.streak ?? 0) >= 7).length;

    res.json({
      generated_at: new Date().toISOString(),
      users_total: userCount,
      profiles_total: profiles.length,
      onboarding_completed: onboardingDone,
      at_least_one_lesson: distinctLessonUsers.length,
      streak_7_days_or_more: streak7,
    });
  } catch (err) {
    console.error('❌ GET /api/admin/funnel:', err);
    res.status(500).json({ error: 'Не удалось собрать воронку' });
  }
});

module.exports = router;
