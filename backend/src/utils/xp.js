const XP_REWARDS = {
  LESSON_COMPLETE: 10,
  REPORT_WITH_DATA: 5,
  STREAK_3: 15,
  STREAK_7: 30,
  MODULE_COMPLETE: 50,
  PERFECT_RATING: 25,
};

const LEVELS = [
  { level: 1, min: 0,    name: 'Новичок' },
  { level: 2, min: 100,  name: 'Практик' },
  { level: 3, min: 300,  name: 'Наставник' },
  { level: 4, min: 700,  name: 'Тренер' },
  { level: 5, min: 1500, name: 'Мастер' },
];

function getLevelByXP(xp) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.min) current = lvl;
  }
  return current;
}

function getNextLevel(xp) {
  const current = getLevelByXP(xp);
  return LEVELS.find((l) => l.level === current.level + 1) ?? null;
}

// hasData: true если пользователь заполнил числовые/текстовые шаги
function calculateXP(rating, hasData, streakCount, isModuleComplete) {
  let total = XP_REWARDS.LESSON_COMPLETE;
  if (hasData) total += XP_REWARDS.REPORT_WITH_DATA;
  if (rating === 3) total += XP_REWARDS.PERFECT_RATING;
  if (streakCount >= 7) total += XP_REWARDS.STREAK_7;
  else if (streakCount >= 3) total += XP_REWARDS.STREAK_3;
  if (isModuleComplete) total += XP_REWARDS.MODULE_COMPLETE;
  return total;
}

module.exports = { XP_REWARDS, LEVELS, getLevelByXP, getNextLevel, calculateXP };
