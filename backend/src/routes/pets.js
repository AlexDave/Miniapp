const express = require('express');
const crypto = require('crypto');
const { prisma } = require('../database/connection');
const logger = require('../utils/logger');
const { getPetIdForUser, joinPetWithToken } = require('../utils/petContext');

const router = express.Router();

/** Текущий питомец и хозяева (семья) */
router.get('/mine', async (req, res) => {
  try {
    const userId = req.user.id;
    const petId = await getPetIdForUser(userId);
    const [pet, members] = await Promise.all([
      prisma.pet.findUnique({ where: { id: petId } }),
      prisma.petMember.findMany({
        where: { pet_id: petId },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { joined_at: 'asc' },
      }),
    ]);
    if (!pet) return res.status(404).json({ error: 'Питомец не найден' });
    const myMember = members.find((m) => m.user_id === userId);
    res.json({
      pet: { id: pet.id, name: pet.name },
      my_role: myMember?.role ?? null,
      members: members.map((m) => ({
        user_id: m.user_id,
        name: m.user?.name || 'Участник',
        role: m.role,
      })),
    });
  } catch (err) {
    logger.error({ err }, 'GET /api/pets/mine');
    res.status(500).json({ error: 'Не удалось загрузить питомца' });
  }
});

/** Последние уроки по питомцу (кто и когда) — для главной */
router.get('/activity', async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(String(req.query.limit), 10) || 8, 1), 40);
    const petId = await getPetIdForUser(req.user.id);
    const rows = await prisma.dailyReport.findMany({
      where: { pet_id: petId },
      orderBy: { completed_at: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true, name: true } },
        lesson: { select: { id: true, title: true } },
      },
    });
    res.json({
      items: rows.map((r) => ({
        id: r.id,
        completed_at: r.completed_at,
        user_name: r.user?.name || 'Участник',
        lesson_id: r.lesson_id,
        lesson_title: r.lesson?.title ?? `Урок ${r.lesson_id}`,
        success: r.success,
      })),
    });
  } catch (err) {
    logger.error({ err }, 'GET /api/pets/activity');
    res.status(500).json({ error: 'Не удалось загрузить активность' });
  }
});

/** Одноразовая ссылка-приглашение (только владелец питомца) */
router.post('/:petId/invite', async (req, res) => {
  try {
    const petId = parseInt(req.params.petId, 10);
    const userId = req.user.id;
    if (!Number.isFinite(petId)) {
      return res.status(400).json({ error: 'Некорректный id питомца' });
    }
    const member = await prisma.petMember.findUnique({
      where: { pet_id_user_id: { pet_id: petId, user_id: userId } },
    });
    if (!member || member.role !== 'owner') {
      return res.status(403).json({ error: 'Приглашать может только владелец питомца' });
    }
    const token = crypto.randomBytes(12).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 86400000);
    await prisma.petInviteToken.create({
      data: { token, pet_id: petId, inviter_user_id: userId, expires_at: expiresAt },
    });
    const bot = process.env.TELEGRAM_BOT_USERNAME;
    const url = bot ? `https://t.me/${bot}?start=pet_${token}` : null;
    res.json({ token, url, expires_at: expiresAt.toISOString() });
  } catch (err) {
    logger.error({ err }, 'POST /api/pets/:id/invite');
    res.status(500).json({ error: 'Не удалось создать приглашение' });
  }
});

router.post('/join/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.user.id;
    const result = await joinPetWithToken(userId, token);
    res.json({ ok: true, pet_id: result.pet_id });
  } catch (err) {
    if (err.code === 'INVALID_OR_EXPIRED_TOKEN') {
      return res.status(400).json({ error: 'Ссылка недействительна или истекла' });
    }
    if (err.code === 'HAS_PERSONAL_HISTORY') {
      return res.status(409).json({
        error: 'У аккаунта уже есть своя история уроков — присоединение к семье недоступно.',
      });
    }
    logger.error({ err }, 'POST /api/pets/join');
    res.status(500).json({ error: 'Не удалось присоединиться' });
  }
});

module.exports = router;
