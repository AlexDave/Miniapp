const express = require('express');
const database = require('../database/connection');
const { isValidId } = require('../utils/validation');

const router = express.Router();

// API для получения треков пользователя
router.get('/', async (req, res) => {
  try {
    const user = await database.findOne('users', { telegram_id: req.user.telegram_id });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const tracks = user.tracks || [];
    res.json(tracks);
  } catch (err) {
    console.error('❌ Ошибка при получении треков пользователя:', err);
    res.status(500).json({ error: 'Ошибка при получении треков пользователя' });
  }
});

// API для добавления трека пользователя
router.post('/', async (req, res) => {
  const { track } = req.body;

  if (!track) {
    return res.status(400).json({ error: 'Трек обязателен' });
  }

  try {
    const user = await database.findOne('users', { telegram_id: req.user.telegram_id });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    await database.updateOne(
      'users',
      { telegram_id: req.user.telegram_id },
      { $push: { tracks: track } }
    );

    res.json({ message: 'Трек добавлен' });
  } catch (err) {
    console.error('❌ Ошибка при добавлении трека:', err);
    res.status(500).json({ error: 'Ошибка при добавлении трека' });
  }
});

// API для удаления трека
router.delete('/:trackId', async (req, res) => {
  const { trackId } = req.params;

  if (!isValidId(trackId)) {
    return res.status(400).json({ error: 'Неверный ID трека' });
  }

  try {
    const result = await database.updateOne(
      'users',
      { telegram_id: req.user.telegram_id },
      { $pull: { tracks: { trackId: parseInt(trackId) } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Трек не найден или уже удалён' });
    }

    res.json({ message: 'Трек удалён' });
  } catch (err) {
    console.error('❌ Ошибка при удалении трека:', err);
    res.status(500).json({ error: 'Ошибка при удалении трека' });
  }
});

// API для выполнения задания и обновления трека
router.put('/:trackId', async (req, res) => {
  const { trackId } = req.params;

  if (!isValidId(trackId)) {
    return res.status(400).json({ error: 'Неверный ID трека' });
  }

  try {
    const user = await database.findOne('users', { telegram_id: req.user.telegram_id });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const track = user.tracks.find(t => t.trackId === parseInt(trackId));

    if (!track) {
      return res.status(404).json({ error: 'Трек не найден' });
    }

    const currentTime = new Date();
    const timeDifference = track.lastCompletedAt ? Math.floor((currentTime - new Date(track.lastCompletedAt)) / 60000) : null;

    // Проверяем, прошло ли 15 минут для повторного выполнения
    if (timeDifference !== null && timeDifference < 15) {
      return res.status(400).json({ error: 'Ещё рано выполнять задание, подождите 15 минут.' });
    }

    // Проверка количества выполнений на сегодня
    if (track.completedToday >= track.requiredPerDay) {
      return res.status(400).json({ error: 'Задание уже выполнено максимальное количество раз за сегодня.' });
    }

    // Обновляем выполнение задания
    track.completedToday += 1;
    track.lastCompletedAt = currentTime;

    // Проверка завершенности дня
    if (track.completedToday >= track.requiredPerDay) {
      track.daysRemaining = Math.max(track.daysRemaining - 1, 0);
      track.completedToday = 0;
    }

    // Проверка завершенности трека
    if (track.daysRemaining === 0) {
      track.isCompleted = true;
    }

    await database.updateOne(
      'users',
      { telegram_id: req.user.telegram_id, 'tracks.trackId': track.trackId },
      { $set: { 'tracks.$': track } }
    );

    res.json({ message: 'Задание выполнено', track });
  } catch (err) {
    console.error('❌ Ошибка при выполнении задания:', err);
    res.status(500).json({ error: 'Ошибка при выполнении задания' });
  }
});

module.exports = router;
