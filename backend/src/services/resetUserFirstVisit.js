const { prisma } = require('../database/connection');

/**
 * Сброс пользователя «как первый вход»: прогресс, онбординг, питомец,
 * напоминания, платежи, чат и т.д.
 * Сохраняются: запись User (telegram_id, id, имя), записи Profile
 * (обнуляется содержимое).
 *
 * Используется маршрутом POST /api/profile/reset и скриптом
 * scripts/reset-user-first-visit.js.
 *
 * @param {number} userId
 * @returns {Promise<{ newPetCreatedForFamilyFork: boolean }>}
 */
async function resetUserFirstVisit(userId) {
  const profile = await prisma.profile.findUnique({ where: { user_id: userId } });
  if (!profile) {
    const err = new Error('Профиль не найден');
    err.code = 'PROFILE_NOT_FOUND';
    throw err;
  }

  let newPetCreatedForFamilyFork = false;

  await prisma.$transaction(async (tx) => {
    // 1. Удаляем весь пользовательский прогресс и связанные записи
    await tx.lessonProgress.deleteMany({ where: { user_id: userId } });
    await tx.dailyReport.deleteMany({ where: { user_id: userId } });
    await tx.courseProgress.deleteMany({ where: { user_id: userId } });
    await tx.userTask.deleteMany({ where: { user_id: userId } });
    await tx.userAchievement.deleteMany({ where: { user_id: userId } });
    await tx.behaviorEvent.deleteMany({ where: { user_id: userId } });
    await tx.chatMessage.deleteMany({ where: { user_id: userId } });
    await tx.userNotification.deleteMany({ where: { user_id: userId } });
    await tx.reminderBindToken.deleteMany({ where: { user_id: userId } });
    await tx.payment.deleteMany({ where: { user_id: userId } });
    await tx.userTrophyVideo.deleteMany({ where: { user_id: userId } });

    // 2. Питомец: если в питомце нет других участников — удаляем его;
    // иначе просто отвязываем этого пользователя («развод» семейного питомца)
    if (profile.pet_id) {
      const members = await tx.petMember.findMany({ where: { pet_id: profile.pet_id } });
      const hasOtherMembers = members.some((m) => m.user_id !== userId);

      if (!hasOtherMembers) {
        await tx.pet.delete({ where: { id: profile.pet_id } });
      } else {
        await tx.petMember.deleteMany({
          where: { pet_id: profile.pet_id, user_id: userId },
        });
      }
      newPetCreatedForFamilyFork = true;
    }

    // 3. Создаём нового питомца «с нуля» (как при первом входе)
    const pet = await tx.pet.create({
      data: { name: profile.pet_name ?? 'Ваш питомец' },
    });
    await tx.petMember.create({
      data: { pet_id: pet.id, user_id: userId, role: 'owner' },
    });

    // 4. Сброс Profile: дефолтные значения, онбординг не пройден
    let prefs = {};
    try {
      prefs = profile.preferences ? JSON.parse(profile.preferences) : {};
    } catch {
      prefs = {};
    }
    prefs.onboarding_completed = false;
    prefs.selected_route_key = null;
    prefs.dog_age_bucket = null;
    prefs.learning_goals = [];
    prefs.primary_problem = null;
    prefs.route_paused = false;

    await tx.profile.update({
      where: { user_id: userId },
      data: {
        pet_id: pet.id,
        level: 1,
        experience: 0,
        coins: 0,
        skills_json: null,
        bones_json: null,
        total_bones: 0,
        special_bones: 0,
        stage: 'Знакомство',
        total_courses: 0,
        completed_courses: 0,
        streak: 0,
        preferences: JSON.stringify(prefs),
      },
    });

    // 5. Сброс напоминаний и тарифа у пользователя
    await tx.user.update({
      where: { id: userId },
      data: {
        reminders_enabled: false,
        reminder_time: null,
        tier: 'free',
        tier_expires_at: null,
      },
    });
  });

  return { newPetCreatedForFamilyFork };
}

module.exports = { resetUserFirstVisit };
