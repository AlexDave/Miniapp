const fs = require('fs');
const path = require('path');
const express = require('express');
const { prisma } = require('../database/connection');

const router = express.Router();

function adminGuard(req, res, next) {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) {
    return res.status(503).json({ error: 'ADMIN_API_KEY не задан в окружении' });
  }
  const headerKey = req.headers['x-admin-key'];
  const auth = req.headers.authorization || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7).trim() : null;
  if (headerKey === expected || bearer === expected) {
    return next();
  }
  return res.status(401).json({ error: 'Нужен заголовок X-Admin-Key или Authorization: Bearer' });
}

/** HTML-дашборд без ключа: ключ вводится в форме и уходит только в запросах к API. */
router.get('/dashboard', (req, res) => {
  const htmlPath = path.join(__dirname, '../../public/admin/dashboard.html');
  try {
    const html = fs.readFileSync(htmlPath, 'utf8');
    res.type('html').send(html);
  } catch {
    res.status(500).send('dashboard.html not found');
  }
});

/**
 * GET /api/admin/funnel?from=ISO&to=ISO
 * Снимок воронки + агрегаты событий analytics_events по дням.
 */
router.get('/funnel', adminGuard, async (req, res) => {
  try {
    const to = req.query.to ? new Date(String(req.query.to)) : new Date();
    const from = req.query.from
      ? new Date(String(req.query.from))
      : new Date(to.getTime() - 30 * 86400000);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
      return res.status(400).json({ error: 'Некорректный диапазон from / to' });
    }

    const [userCount, profiles, distinctLessonUsers, eventsInRange] = await Promise.all([
      prisma.user.count(),
      prisma.profile.findMany({
        select: { preferences: true, streak: true },
      }),
      prisma.dailyReport.groupBy({
        by: ['user_id'],
        _count: { user_id: true },
      }),
      prisma.analyticsEvent.findMany({
        where: { ts: { gte: from, lte: to } },
        select: { event: true, ts: true },
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

    const streak7 = profiles.filter((p) => (p.streak ?? 0) >= 7).length;

    const eventsTotals = {};
    const byDayMap = {};
    for (const e of eventsInRange) {
      eventsTotals[e.event] = (eventsTotals[e.event] || 0) + 1;
      const d = e.ts.toISOString().slice(0, 10);
      if (!byDayMap[d]) byDayMap[d] = {};
      byDayMap[d][e.event] = (byDayMap[d][e.event] || 0) + 1;
    }
    const events_by_day = Object.keys(byDayMap)
      .sort()
      .map((date) => ({ date, counts: byDayMap[date] }));

    const successReports = await prisma.dailyReport.groupBy({
      by: ['success'],
      _count: { _all: true },
    });
    let lessonSuccessRate = null;
    const totalRep = successReports.reduce((s, r) => s + r._count._all, 0);
    if (totalRep > 0) {
      const ok = successReports
        .filter((r) => r.success === 'yes' || r.success === 'partial')
        .reduce((s, r) => s + r._count._all, 0);
      lessonSuccessRate = Math.round((ok / totalRep) * 1000) / 10;
    }

    const onboardingToFirstLessonPct =
      onboardingDone > 0
        ? Math.round((Math.min(onboardingDone, distinctLessonUsers.length) / onboardingDone) * 1000) / 10
        : null;

    res.json({
      generated_at: new Date().toISOString(),
      range: { from: from.toISOString(), to: to.toISOString() },
      snapshot: {
        users_total: userCount,
        profiles_total: profiles.length,
        onboarding_completed: onboardingDone,
        at_least_one_lesson: distinctLessonUsers.length,
        streak_7_days_or_more: streak7,
        onboarding_to_first_lesson_pct_approx: onboardingToFirstLessonPct,
        lesson_success_rate_pct: lessonSuccessRate,
      },
      analytics_events_in_range: eventsInRange.length,
      events_totals: eventsTotals,
      events_by_day,
    });
  } catch (err) {
    console.error('❌ GET /api/admin/funnel:', err);
    res.status(500).json({ error: 'Не удалось собрать воронку' });
  }
});

/**
 * GET /api/admin/cohort?week_start=YYYY-MM-DD (понедельник UTC недели когорты)
 * Retention: доля пользователей с ≥1 отчётом за D1 / D7 / D30 от created_at.
 */
router.get('/cohort', adminGuard, async (req, res) => {
  try {
    let weekStart = req.query.week_start ? new Date(String(req.query.week_start)) : null;
    if (!weekStart || Number.isNaN(weekStart.getTime())) {
      const now = new Date();
      const dow = now.getUTCDay();
      const diff = (dow + 6) % 7;
      weekStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff));
      weekStart.setUTCHours(0, 0, 0, 0);
    } else {
      weekStart = new Date(weekStart);
      weekStart.setUTCHours(0, 0, 0, 0);
    }
    const weekEnd = new Date(weekStart.getTime() + 7 * 86400000 - 1);

    const cohortUsers = await prisma.user.findMany({
      where: { created_at: { gte: weekStart, lte: weekEnd } },
      select: { id: true, created_at: true },
    });
    const n = cohortUsers.length;
    if (n === 0) {
      return res.json({
        week_start: weekStart.toISOString(),
        week_end: new Date(weekEnd).toISOString(),
        cohort_size: 0,
        retention: { d1_pct: null, d7_pct: null, d30_pct: null },
      });
    }

    const ids = cohortUsers.map((u) => u.id);
    const reports = await prisma.dailyReport.findMany({
      where: { user_id: { in: ids } },
      select: { user_id: true, completed_at: true },
    });

    function pctWithinDays(days) {
      let ok = 0;
      for (const u of cohortUsers) {
        const t0 = new Date(u.created_at).getTime();
        const deadline = t0 + days * 86400000;
        const has = reports.some(
          (r) => r.user_id === u.id && new Date(r.completed_at).getTime() <= deadline
        );
        if (has) ok++;
      }
      return Math.round((ok / n) * 1000) / 10;
    }

    res.json({
      week_start: weekStart.toISOString(),
      week_end: new Date(weekEnd).toISOString(),
      cohort_size: n,
      retention: {
        d1_pct: pctWithinDays(1),
        d7_pct: pctWithinDays(7),
        d30_pct: pctWithinDays(30),
      },
    });
  } catch (err) {
    console.error('❌ GET /api/admin/cohort:', err);
    res.status(500).json({ error: 'Не удалось посчитать когорту' });
  }
});

/** Заглушка возврата Stars (спринт 23). */
router.post('/payments/refund', adminGuard, async (req, res) => {
  res.status(501).json({
    error: 'Авто-возврат не подключён. Оформите через поддержку Telegram / политику Stars.',
  });
});

module.exports = router;
