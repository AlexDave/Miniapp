const { prisma } = require('../database/connection');

async function checkAndAwardAchievements(userId) {
  const [profile, allAchievements, userAchievements, completedTracks, streak] = await Promise.all([
    prisma.profile.findUnique({ where: { user_id: userId } }),
    prisma.achievement.findMany({ where: { is_active: true } }),
    prisma.userAchievement.findMany({ where: { user_id: userId }, select: { achievement_id: true } }),
    prisma.userTrack.count({ where: { user_id: userId, is_completed: true } }),
    prisma.profile.findUnique({ where: { user_id: userId }, select: { streak: true } }),
  ]);

  const earnedIds = new Set(userAchievements.map((a) => a.achievement_id));
  const newlyEarned = [];

  for (const achievement of allAchievements) {
    if (earnedIds.has(achievement.id)) continue;

    let earned = false;
    try {
      const condition = JSON.parse(achievement.condition);
      if (condition.type === 'tracks_completed' && completedTracks >= condition.value) earned = true;
      if (condition.type === 'streak' && streak?.streak >= condition.value) earned = true;
    } catch {
      continue;
    }

    if (earned) {
      await prisma.userAchievement.create({ data: { user_id: userId, achievement_id: achievement.id } });
      newlyEarned.push(achievement);
    }
  }

  return newlyEarned;
}

module.exports = { checkAndAwardAchievements };
