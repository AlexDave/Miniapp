const express = require('express');
const { prisma } = require('../database/connection');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { user_id: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Профиль не найден' });
    }

    let skills = { focus: 0, recall: 0, sit: 0 };
    try {
      skills = profile.skills_json ? { ...skills, ...JSON.parse(profile.skills_json) } : skills;
    } catch {
      /* ignore */
    }

    res.json({
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
    });
  } catch (err) {
    logger.error({ err }, 'Ошибка при получении профиля');
    res.status(500).json({ error: 'Ошибка при получении профиля' });
  }
});

router.put('/', async (req, res) => {
  const { petName, bio, avatar } = req.body;

  try {
    const profile = await prisma.profile.update({
      where: { user_id: req.user.id },
      data: {
        ...(petName !== undefined && { pet_name: petName }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
      },
    });

    let skills = { focus: 0, recall: 0, sit: 0 };
    try {
      skills = profile.skills_json ? { ...skills, ...JSON.parse(profile.skills_json) } : skills;
    } catch {
      /* ignore */
    }

    res.json({
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
    });
  } catch (err) {
    logger.error({ err }, 'Ошибка при обновлении профиля');
    res.status(500).json({ error: 'Ошибка при обновлении профиля' });
  }
});

module.exports = router;
