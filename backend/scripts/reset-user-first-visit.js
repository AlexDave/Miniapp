/**
 * Сброс пользователя «как первый вход»: прогресс, онбординг, питомец, напоминания, платежи, чат и т.д.
 * Сохраняются: запись User (telegram_id, id, имя), запись Profile (обнуляется содержимое).
 *
 * RESET_USER_ID — числовой id пользователя; если не задан — первый пользователь по id.
 *
 *   cd backend && node scripts/reset-user-first-visit.js
 *   RESET_USER_ID=2 node scripts/reset-user-first-visit.js
 */
require('dotenv').config();

const { prisma } = require('../src/database/connection');
const { ensureDefaultPetForUser } = require('../src/utils/petContext');

const DEFAULT_SKILLS_JSON = JSON.stringify({ focus: 0, recall: 0, sit: 0 });
const FRESH_PREFS = JSON.stringify({ onboarding_completed: false });

async function deleteUserScoped(tx, userId) {
  await tx.analyticsEvent.deleteMany({ where: { user_id: userId } });
  await tx.userTrophyVideo.deleteMany({ where: { user_id: userId } });
  await tx.behaviorEvent.deleteMany({ where: { user_id: userId } });
  await tx.chatMessage.deleteMany({ where: { user_id: userId } });
  await tx.courseProgress.deleteMany({ where: { user_id: userId } });
  await tx.userAchievement.deleteMany({ where: { user_id: userId } });
  await tx.userTask.deleteMany({ where: { user_id: userId } });
  await tx.reminderBindToken.deleteMany({ where: { user_id: userId } });
  await tx.payment.deleteMany({ where: { user_id: userId } });
  await tx.petInviteToken.deleteMany({ where: { inviter_user_id: userId } });
  await tx.userNotification.deleteMany({ where: { user_id: userId } });
}

async function resetProfileRow(tx, userId, petId) {
  await tx.profile.update({
    where: { user_id: userId },
    data: {
      pet_id: petId,
      pet_name: 'Ваш питомец',
      avatar: null,
      level: 1,
      experience: 0,
      coins: 0,
      skills_json: DEFAULT_SKILLS_JSON,
      bones_json: null,
      total_bones: 0,
      special_bones: 0,
      stage: 'Знакомство',
      total_courses: 0,
      completed_courses: 0,
      streak: 0,
      bio: null,
      preferences: FRESH_PREFS,
    },
  });
}

async function resetUserRow(tx, userId) {
  await tx.user.update({
    where: { id: userId },
    data: {
      telegram_chat_id: null,
      reminders_enabled: false,
      reminder_time: null,
      reminder_tz: null,
      reminder_quiet_weekends: false,
      last_reminder_sent_at: null,
      tier: 'free',
      tier_expires_at: null,
    },
  });
}

async function main() {
  const raw = process.env.RESET_USER_ID;
  let userId;
  if (raw != null && String(raw).trim() !== '') {
    userId = parseInt(String(raw).trim(), 10);
    if (!Number.isFinite(userId)) throw new Error(`Некорректный RESET_USER_ID: ${raw}`);
  } else {
    const u = await prisma.user.findFirst({ orderBy: { id: 'asc' } });
    if (!u) throw new Error('В БД нет пользователей');
    userId = u.id;
  }

  const profile = await prisma.profile.findUnique({ where: { user_id: userId } });
  if (!profile) throw new Error(`Нет профиля для user_id=${userId}`);

  let createdSoloPetId = null;

  await prisma.$transaction(async (tx) => {
    await deleteUserScoped(tx, userId);

    const petId = profile.pet_id;

    if (petId) {
      const otherMembers = await tx.petMember.count({
        where: { pet_id: petId, user_id: { not: userId } },
      });

      if (otherMembers === 0) {
        await tx.petMember.deleteMany({ where: { user_id: userId } });
        await tx.pet.delete({ where: { id: petId } });
        await resetProfileRow(tx, userId, null);
      } else {
        await tx.petMember.deleteMany({ where: { user_id: userId, pet_id: petId } });
        const pet = await tx.pet.create({
          data: {
            name: 'Ваш питомец',
            level: 1,
            experience: 0,
            coins: 0,
            skills_json: DEFAULT_SKILLS_JSON,
            bones_json: null,
            total_bones: 0,
            special_bones: 0,
            stage: 'Знакомство',
            streak: 0,
            total_courses: 0,
            completed_courses: 0,
          },
        });
        createdSoloPetId = pet.id;
        await tx.petMember.create({
          data: { pet_id: pet.id, user_id: userId, role: 'owner' },
        });
        await resetProfileRow(tx, userId, pet.id);
      }
    } else {
      await resetProfileRow(tx, userId, null);
    }

    await resetUserRow(tx, userId);
  });

  const after = await prisma.profile.findUnique({
    where: { user_id: userId },
    select: { pet_id: true },
  });
  if (!after?.pet_id) {
    await ensureDefaultPetForUser(userId);
  }

  // Имя питомца на Pet совпадает с профилем после ensure
  const p = await prisma.profile.findUnique({
    where: { user_id: userId },
    select: { pet_id: true, pet_name: true },
  });
  if (p?.pet_id) {
    await prisma.pet.update({
      where: { id: p.pet_id },
      data: { name: p.pet_name },
    });
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        user_id: userId,
        new_pet_created_for_family_fork: createdSoloPetId,
        message: 'Пользователь сброшен: онбординг, прогресс, напоминания, подписка, история уроков.',
      },
      null,
      2
    )
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
