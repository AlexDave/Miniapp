const express = require('express');
const { prisma } = require('../database/connection');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { user_id: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Профиль не найден' });
    }

    res.json({
      id: profile.id,
      petName: profile.pet_name,
      avatar: profile.avatar,
      level: profile.level,
      experience: profile.experience,
      totalCourses: profile.total_courses,
      completedCourses: profile.completed_courses,
      streak: profile.streak,
      bio: profile.bio,
    });
  } catch (err) {
    console.error('❌ Ошибка при получении профиля:', err);
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

    res.json({
      id: profile.id,
      petName: profile.pet_name,
      avatar: profile.avatar,
      level: profile.level,
      experience: profile.experience,
      totalCourses: profile.total_courses,
      completedCourses: profile.completed_courses,
      streak: profile.streak,
      bio: profile.bio,
    });
  } catch (err) {
    console.error('❌ Ошибка при обновлении профиля:', err);
    res.status(500).json({ error: 'Ошибка при обновлении профиля' });
  }
});

module.exports = router;
