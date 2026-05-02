const express = require('express');
const { prisma } = require('../database/connection');
const logger = require('../utils/logger');

const router = express.Router();

const COOLDOWN_MINUTES = 15;

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

async function updateStreak(userId, now) {
  const profile = await prisma.profile.findUnique({ where: { user_id: userId } });
  if (!profile) return;

  // Ищем последнее выполнение любого трека пользователем (кроме текущего момента)
  const lastTrack = await prisma.userTrack.findFirst({
    where: {
      user_id: userId,
      last_completed_at: { lt: now },
    },
    orderBy: { last_completed_at: 'desc' },
  });

  let newStreak = profile.streak;

  if (!lastTrack?.last_completed_at) {
    newStreak = 1;
  } else {
    const last = new Date(lastTrack.last_completed_at);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(last, now)) {
      // Уже выполнял сегодня — streak не меняется
      return;
    } else if (isSameDay(last, yesterday)) {
      // Выполнял вчера — продолжаем серию
      newStreak = profile.streak + 1;
    } else {
      // Пропустил день — сброс
      newStreak = 1;
    }
  }

  await prisma.profile.update({
    where: { user_id: userId },
    data: { streak: newStreak },
  });
}

router.get('/', async (req, res) => {
  try {
    const userTracks = await prisma.userTrack.findMany({
      where: { user_id: req.user.id },
      include: { track: true },
      orderBy: { started_at: 'desc' },
    });
    res.json(userTracks);
  } catch (err) {
    logger.error({ err }, 'Ошибка при получении треков');
    res.status(500).json({ error: 'Ошибка при получении треков' });
  }
});

router.post('/', async (req, res) => {
  const { track_id } = req.body;
  if (!track_id) {
    return res.status(400).json({ error: 'track_id обязателен' });
  }

  try {
    const track = await prisma.track.findUnique({ where: { id: parseInt(track_id, 10) } });
    if (!track) {
      return res.status(404).json({ error: 'Трек не найден' });
    }

    const existing = await prisma.userTrack.findUnique({
      where: { user_id_track_id: { user_id: req.user.id, track_id: track.id } },
    });
    if (existing) {
      return res.status(409).json({ error: 'Трек уже добавлен' });
    }

    const userTrack = await prisma.userTrack.create({
      data: {
        user_id: req.user.id,
        track_id: track.id,
        days_remaining: track.duration_days,
      },
      include: { track: true },
    });

    res.status(201).json(userTrack);
  } catch (err) {
    logger.error({ err }, 'Ошибка при добавлении трека');
    res.status(500).json({ error: 'Ошибка при добавлении трека' });
  }
});

router.put('/:trackId', async (req, res) => {
  const trackId = parseInt(req.params.trackId, 10);
  if (isNaN(trackId)) {
    return res.status(400).json({ error: 'Неверный ID трека' });
  }

  try {
    const userTrack = await prisma.userTrack.findUnique({
      where: { user_id_track_id: { user_id: req.user.id, track_id: trackId } },
      include: { track: true },
    });

    if (!userTrack) {
      return res.status(404).json({ error: 'Трек не найден' });
    }

    if (userTrack.is_completed) {
      return res.status(400).json({ error: 'Трек уже завершён' });
    }

    if (userTrack.last_completed_at) {
      const minutesSince = (Date.now() - new Date(userTrack.last_completed_at)) / 60000;
      if (minutesSince < COOLDOWN_MINUTES) {
        const waitMin = Math.ceil(COOLDOWN_MINUTES - minutesSince);
        return res.status(400).json({ error: `Подождите ещё ${waitMin} мин. перед следующим выполнением` });
      }
    }

    const requiredPerDay = userTrack.track.duration_days > 0 ? 1 : 1;
    const newCompletedToday = userTrack.completed_today + 1;
    const dayDone = newCompletedToday >= requiredPerDay;

    const newDaysRemaining = dayDone ? Math.max(userTrack.days_remaining - 1, 0) : userTrack.days_remaining;
    const isCompleted = newDaysRemaining === 0 && dayDone;

    const now = new Date();

    const updated = await prisma.userTrack.update({
      where: { user_id_track_id: { user_id: req.user.id, track_id: trackId } },
      data: {
        completed_today: dayDone ? 0 : newCompletedToday,
        last_completed_at: now,
        days_remaining: newDaysRemaining,
        is_completed: isCompleted,
        completed_at: isCompleted ? now : null,
      },
      include: { track: true },
    });

    // Обновляем streak в профиле пользователя
    await updateStreak(req.user.id, now);

    res.json({ message: 'Задание выполнено', userTrack: updated });
  } catch (err) {
    logger.error({ err }, 'Ошибка при выполнении задания');
    res.status(500).json({ error: 'Ошибка при выполнении задания' });
  }
});

router.delete('/:trackId', async (req, res) => {
  const trackId = parseInt(req.params.trackId, 10);
  if (isNaN(trackId)) {
    return res.status(400).json({ error: 'Неверный ID трека' });
  }

  try {
    const existing = await prisma.userTrack.findUnique({
      where: { user_id_track_id: { user_id: req.user.id, track_id: trackId } },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Трек не найден' });
    }

    await prisma.userTrack.delete({
      where: { user_id_track_id: { user_id: req.user.id, track_id: trackId } },
    });

    res.json({ message: 'Трек удалён' });
  } catch (err) {
    logger.error({ err }, 'Ошибка при удалении трека');
    res.status(500).json({ error: 'Ошибка при удалении трека' });
  }
});

module.exports = router;
