// Сброс профиля к состоянию «первого визита».
// Восстанавливает отсутствующий модуль, из-за которого backend падал на старте
// (Error: Cannot find module '../services/resetUserFirstVisit').
//
// Логика зеркалит завершение онбординга (src/routes/onboarding.js) в обратную
// сторону: очищается прогресс уроков и флаги онбординга в preferences,
// при этом сам профиль, питомец, косточки/стрик и платный tier сохраняются —
// как при «первом входе» без потери аккаунта.

const { prisma } = require('../database/connection');
const logger = require('../utils/logger');
const { parsePreferences } = require('../utils/profilePreferences');

async function resetUserFirstVisit(userId) {
  const profile = await prisma.profile.findUnique({ where: { user_id: userId } });
  if (!profile) {
    const err = new Error('Профиль не найден');
    err.code = 'PROFILE_NOT_FOUND';
    throw err;
  }

  const prefs = parsePreferences(profile.preferences);

  // Флаги/данные онбординга и маршрута — сбрасываем к дефолтам первого визита
  prefs.onboarding_completed = false;
  delete prefs.dog_age_bucket;
  delete prefs.selected_route_key;
  prefs.route_paused = false;
  prefs.learning_goals = [];
  prefs.primary_problem = null;

  await prisma.$transaction([
    prisma.lessonProgress.deleteMany({ where: { user_id: userId } }),
    prisma.profile.update({
      where: { user_id: userId },
      data: { preferences: JSON.stringify(prefs) },
    }),
  ]);

  logger.info({ userId }, 'Профиль сброшен к первому визиту');
}

module.exports = { resetUserFirstVisit };
