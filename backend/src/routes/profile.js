const express = require('express');
const crypto = require('crypto');
const { prisma } = require('../database/connection');
const logger = require('../utils/logger');
const { parsePreferences, mergePreferences } = require('../utils/profilePreferences');
const { parseBones } = require('../utils/bones');
const { buildProfileResponse } = require('../utils/profileResponse');
const { USER_AUX_FOR_PROFILE } = require('../constants/profileUserSelect');
const { ensureDefaultPetForUser } = require('../utils/petContext');
const { resetUserFirstVisit } = require('../services/resetUserFirstVisit');

const router = express.Router();

const TIME_HHMM = /^([0-1]?\d|2[0-3]):([0-5]\d)$/;

async function loadProfileBundle(userId) {
  let profile = await prisma.profile.findUnique({
    where: { user_id: userId },
    include: { pet: true },
  });
  if (profile && !profile.pet_id) {
    await ensureDefaultPetForUser(userId);
    profile = await prisma.profile.findUnique({
      where: { user_id: userId },
      include: { pet: true },
    });
  }
  const user = await prisma.user.findUnique({ where: { id: userId }, select: USER_AUX_FOR_PROFILE });
  return { profile, user, pet: profile?.pet ?? null };
}

router.get('/', async (req, res) => {
  try {
    const { profile, user, pet } = await loadProfileBundle(req.user.id);

    if (!profile) {
      return res.status(404).json({ error: 'Профиль не найден' });
    }

    res.json(buildProfileResponse(profile, user, pet));
  } catch (err) {
    logger.error({ err }, 'Ошибка при получении профиля');
    res.status(500).json({ error: 'Ошибка при получении профиля' });
  }
});

/** Deep-link для привязки chat_id в боте (/start bind_TOKEN) */
router.get('/reminder-bind-link', async (req, res) => {
  try {
    const bot = process.env.TELEGRAM_BOT_USERNAME;
    if (!bot) {
      return res.status(503).json({ error: 'Не задан TELEGRAM_BOT_USERNAME' });
    }
    const token = crypto.randomBytes(10).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600000);
    await prisma.reminderBindToken.create({
      data: { token, user_id: req.user.id, expires_at: expiresAt },
    });
    const url = `https://t.me/${bot}?start=bind_${token}`;
    res.json({ url });
  } catch (err) {
    logger.error({ err }, 'reminder-bind-link');
    res.status(500).json({ error: 'Не удалось создать ссылку' });
  }
});

router.post('/reset', async (req, res) => {
  try {
    await resetUserFirstVisit(req.user.id);
    const { profile, user, pet } = await loadProfileBundle(req.user.id);
    if (!profile) {
      return res.status(404).json({ error: 'Профиль не найден' });
    }
    res.json(buildProfileResponse(profile, user, pet));
  } catch (err) {
    if (err.code === 'PROFILE_NOT_FOUND') {
      return res.status(404).json({ error: 'Профиль не найден' });
    }
    logger.error({ err }, 'Сброс профиля');
    res.status(500).json({ error: 'Не удалось сбросить профиль' });
  }
});

router.put('/', async (req, res) => {
  const {
    petName,
    bio,
    avatar,
    preferences: preferencesPatch,
    remindersEnabled,
    reminderTime,
    reminderTz,
    reminderQuietWeekends,
  } = req.body;

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
    if (petName !== undefined && current.pet_id) {
      await prisma.pet.update({
        where: { id: current.pet_id },
        data: { name: String(petName).trim().slice(0, 80) },
      });
    }
    if (preferencesPatch && typeof preferencesPatch === 'object') {
      data.preferences = JSON.stringify(mergedPrefs);
    }

    const userData = {};
    if (remindersEnabled !== undefined) userData.reminders_enabled = !!remindersEnabled;
    if (reminderQuietWeekends !== undefined) {
      userData.reminder_quiet_weekends = !!reminderQuietWeekends;
    }
    if (reminderTime !== undefined) {
      const t = String(reminderTime).trim();
      if (!TIME_HHMM.test(t)) {
        return res.status(400).json({ error: 'reminderTime ожидается в формате HH:mm' });
      }
      const [, h, m] = t.match(TIME_HHMM);
      userData.reminder_time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    if (reminderTz !== undefined) {
      const z = String(reminderTz).trim();
      if (z.length > 80) {
        return res.status(400).json({ error: 'reminderTz слишком длинный' });
      }
      userData.reminder_tz = z || 'Europe/Moscow';
    }

    const profile = await prisma.profile.update({
      where: { user_id: req.user.id },
      data,
    });

    if (Object.keys(userData).length > 0) {
      userData.updated_at = new Date();
      await prisma.user.update({
        where: { id: req.user.id },
        data: userData,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: USER_AUX_FOR_PROFILE,
    });
    const pet = profile.pet_id
      ? await prisma.pet.findUnique({ where: { id: profile.pet_id } })
      : null;

    res.json(buildProfileResponse(profile, user, pet));
  } catch (err) {
    logger.error({ err }, 'Ошибка при обновлении профиля');
    res.status(500).json({ error: 'Ошибка при обновлении профиля' });
  }
});

router.get('/bones', async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { user_id: req.user.id },
      select: { pet_id: true },
    });
    if (!profile?.pet_id) return res.status(404).json({ error: 'Профиль не найден' });
    const pet = await prisma.pet.findUnique({
      where: { id: profile.pet_id },
      select: { bones_json: true, total_bones: true, special_bones: true, stage: true },
    });
    if (!pet) return res.status(404).json({ error: 'Питомец не найден' });

    res.json({
      by_skill: parseBones(pet.bones_json),
      total: pet.total_bones ?? 0,
      special: pet.special_bones ?? 0,
      stage: pet.stage ?? 'Знакомство',
    });
  } catch (err) {
    logger.error({ err }, 'Ошибка при получении косточек');
    res.status(500).json({ error: 'Ошибка при получении косточек' });
  }
});

module.exports = router;
