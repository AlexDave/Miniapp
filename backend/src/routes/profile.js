const express = require('express');
const { prisma } = require('../database/connection');
const logger = require('../utils/logger');
const { parsePreferences, mergePreferences, preferencesToPublic } = require('../utils/profilePreferences');
const { parseBones } = require('../utils/bones');

const router = express.Router();

function buildProfileResponse(profile) {
  let skills = { focus: 0, recall: 0, sit: 0 };
  try {
    skills = profile.skills_json ? { ...skills, ...JSON.parse(profile.skills_json) } : skills;
  } catch {
    /* ignore */
  }

  const prefs = parsePreferences(profile.preferences);
  const publicPrefs = preferencesToPublic(prefs);

  return {
    id: profile.id,
    petName: profile.pet_name,
    avatar: profile.avatar,
    level: profile.level,
    experience: profile.experience,
    coins: profile.coins ?? 0,
    skills,
    totalCourses: profile.total_courses,
    completedCourses: profile.completed_courses,
    streak: profile.streak,
    bio: profile.bio,
    // Косточки
    totalBones: profile.total_bones ?? 0,
    specialBones: profile.special_bones ?? 0,
    stage: profile.stage ?? 'Знакомство',
    bones: parseBones(profile.bones_json),
    ...publicPrefs,
  };
}

router.get('/', async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { user_id: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Профиль не найден' });
    }

    res.json(buildProfileResponse(profile));
  } catch (err) {
    logger.error({ err }, 'Ошибка при получении профиля');
    res.status(500).json({ error: 'Ошибка при получении профиля' });
  }
});

router.put('/', async (req, res) => {
  const { petName, bio, avatar, preferences: preferencesPatch } = req.body;

  try {
    const current = await prisma.profile.findUnique({
      where: { user_id: req.user.id },
    });
    if (!current) {
      return res.status(404).json({ error: 'Профиль не найден' });
    }

    const mergedPrefs =
      preferencesPatch && typeof preferencesPatch === 'object'
        ? mergePreferences(current.preferences, preferencesPatch)
        : parsePreferences(current.preferences);

    const data = {
      ...(petName !== undefined && { pet_name: petName }),
      ...(bio !== undefined && { bio }),
      ...(avatar !== undefined && { avatar }),
    };
    if (preferencesPatch && typeof preferencesPatch === 'object') {
      data.preferences = JSON.stringify(mergedPrefs);
    }

    const profile = await prisma.profile.update({
      where: { user_id: req.user.id },
      data,
    });

    res.json(buildProfileResponse(profile));
  } catch (err) {
    logger.error({ err }, 'Ошибка при обновлении профиля');
    res.status(500).json({ error: 'Ошибка при обновлении профиля' });
  }
});

// Косточки пользователя по навыкам
router.get('/bones', async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { user_id: req.user.id },
      select: { bones_json: true, total_bones: true, special_bones: true, stage: true },
    });
    if (!profile) return res.status(404).json({ error: 'Профиль не найден' });

    res.json({
      by_skill:      parseBones(profile.bones_json),
      total:         profile.total_bones ?? 0,
      special:       profile.special_bones ?? 0,
      stage:         profile.stage ?? 'Знакомство',
    });
  } catch (err) {
    logger.error({ err }, 'Ошибка при получении косточек');
    res.status(500).json({ error: 'Ошибка при получении косточек' });
  }
});

module.exports = router;
