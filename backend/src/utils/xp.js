const { prisma } = require('../database/connection');

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000];

function getLevelForXp(xp) {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

async function awardXp(userId, amount) {
  const profile = await prisma.profile.findUnique({ where: { user_id: userId } });
  if (!profile) return null;

  const newXp = profile.experience + amount;
  const newLevel = getLevelForXp(newXp);

  const updated = await prisma.profile.update({
    where: { user_id: userId },
    data: { experience: newXp, level: newLevel },
  });

  return { xp: newXp, level: newLevel, leveledUp: newLevel > profile.level };
}

module.exports = { awardXp, getLevelForXp, LEVEL_THRESHOLDS };
