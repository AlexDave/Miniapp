const { prisma } = require('../database/connection');

/**
 * Возвращает pet_id активного питомца пользователя (создаёт Pet + владельца при отсутствии).
 */
async function getPetIdForUser(userId) {
  const row = await prisma.profile.findUnique({
    where: { user_id: userId },
    select: { pet_id: true },
  });
  if (row?.pet_id) return row.pet_id;
  return ensureDefaultPetForUser(userId);
}

async function ensureDefaultPetForUser(userId) {
  return prisma.$transaction(async (tx) => {
    const profile = await tx.profile.findUnique({ where: { user_id: userId } });
    if (!profile) throw new Error('PROFILE_MISSING');
    if (profile.pet_id) return profile.pet_id;

    const pet = await tx.pet.create({
      data: {
        name: profile.pet_name,
        level: profile.level,
        experience: profile.experience,
        coins: profile.coins ?? 0,
        skills_json: profile.skills_json,
        bones_json: profile.bones_json,
        total_bones: profile.total_bones ?? 0,
        special_bones: profile.special_bones ?? 0,
        stage: profile.stage ?? 'Знакомство',
        streak: profile.streak ?? 0,
        total_courses: profile.total_courses ?? 0,
        completed_courses: profile.completed_courses ?? 0,
      },
    });
    await tx.petMember.create({
      data: { pet_id: pet.id, user_id: userId, role: 'owner' },
    });
    await tx.profile.update({
      where: { user_id: userId },
      data: { pet_id: pet.id },
    });
    return pet.id;
  });
}

/**
 * Присоединение к питомцу по одноразовому токену (семья).
 * Нельзя, если у пользователя уже есть свои отчёты по урокам (личная история).
 */
async function joinPetWithToken(userId, token) {
  const row = await prisma.petInviteToken.findUnique({ where: { token } });
  if (!row || row.expires_at < new Date()) {
    const err = new Error('INVALID_OR_EXPIRED_TOKEN');
    err.code = 'INVALID_OR_EXPIRED_TOKEN';
    throw err;
  }
  const personalReports = await prisma.dailyReport.count({ where: { user_id: userId } });
  if (personalReports > 0) {
    const err = new Error('HAS_PERSONAL_HISTORY');
    err.code = 'HAS_PERSONAL_HISTORY';
    throw err;
  }
  const targetPetId = row.pet_id;
  await prisma.$transaction(async (tx) => {
    await tx.petMember.deleteMany({ where: { user_id: userId } });
    await tx.profile.update({
      where: { user_id: userId },
      data: { pet_id: targetPetId },
    });
    await tx.petMember.upsert({
      where: { pet_id_user_id: { pet_id: targetPetId, user_id: userId } },
      create: { pet_id: targetPetId, user_id: userId, role: 'member' },
      update: { role: 'member' },
    });
    await tx.petInviteToken.delete({ where: { token } });
  });
  return { pet_id: targetPetId };
}

module.exports = { getPetIdForUser, ensureDefaultPetForUser, joinPetWithToken };
