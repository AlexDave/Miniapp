const STAGES = [
  { key: 'Знакомство',     min: 0  },
  { key: 'Базовые навыки', min: 5  },
  { key: 'Уверенный',      min: 15 },
  { key: 'Самостоятельный',min: 30 },
  { key: 'Партнёр',        min: 60 },
];

function getStage(totalBones) {
  let stage = STAGES[0];
  for (const s of STAGES) {
    if (totalBones >= s.min) stage = s;
  }
  return stage.key;
}

function parseBones(json) {
  if (!json) return {};
  try { return typeof json === 'string' ? JSON.parse(json) : json; }
  catch { return {}; }
}

/**
 * Начислить косточку пользователю за урок.
 * Возвращает { bones_earned, is_special, new_total, new_stage, bones_json }.
 */
const { getPetIdForUser } = require('./petContext');

async function awardBone(prisma, userId, skillKey, { isRepeat = false, streakCount = 0 } = {}) {
  const petId = await getPetIdForUser(userId);
  const profilePet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!profilePet) return { bones_earned: 0 };

  const bones = parseBones(profilePet.bones_json);
  const key = skillKey || 'general';

  let bonesEarned = 1;
  let isSpecial = false;

  if (isRepeat) {
    bonesEarned = 1;
  }

  if (streakCount > 0 && streakCount % 7 === 0) {
    isSpecial = true;
  }

  bones[key] = (bones[key] ?? 0) + bonesEarned;
  const totalBones = (profilePet.total_bones ?? 0) + bonesEarned;
  const specialBones = (profilePet.special_bones ?? 0) + (isSpecial ? 1 : 0);
  const newStage = getStage(totalBones);

  await prisma.pet.update({
    where: { id: petId },
    data: {
      bones_json:    JSON.stringify(bones),
      total_bones:   totalBones,
      special_bones: specialBones,
      stage:         newStage,
    },
  });

  return {
    bones_earned: bonesEarned,
    is_special:   isSpecial,
    new_total:    totalBones,
    new_stage:    newStage,
    bones_json:   bones,
  };
}

module.exports = { awardBone, getStage, parseBones, STAGES };
