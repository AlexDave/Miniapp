const path = require('path');
const express = require('express');

const router = express.Router();

const lessonMediaDir = path.join(__dirname, '../../public/lesson-media');
router.use(
  '/lesson-media',
  express.static(lessonMediaDir, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    setHeaders(res) {
      res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
    },
  })
);

router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

module.exports = router;
