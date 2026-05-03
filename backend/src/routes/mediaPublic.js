const express = require('express');
const path = require('path');
const fs = require('fs');
const { prisma } = require('../database/connection');
const { verifyTrophyStream } = require('../utils/trophyVideoSign');

const router = express.Router();

router.get('/trophy/:videoId', async (req, res) => {
  try {
    const videoId = parseInt(req.params.videoId, 10);
    if (!Number.isFinite(videoId)) {
      return res.status(400).json({ error: 'Некорректный id' });
    }
    const { e, s } = req.query;
    if (!e || !s) {
      return res.status(403).json({ error: 'Нужна подпись ссылки' });
    }

    const video = await prisma.userTrophyVideo.findUnique({ where: { id: videoId } });
    if (!video) {
      return res.status(404).json({ error: 'Не найдено' });
    }
    if (!verifyTrophyStream(video.user_id, videoId, String(e), String(s))) {
      return res.status(403).json({ error: 'Ссылка недействительна' });
    }

    const filePath = path.join(__dirname, '../../public/user-videos', video.storage_key);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Файл не найден' });
    }

    res.setHeader('Content-Type', video.mime_type || 'video/mp4');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error('❌ GET /api/media/trophy:', err);
    res.status(500).json({ error: 'Ошибка отдачи файла' });
  }
});

module.exports = router;
