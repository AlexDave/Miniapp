const express = require('express');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
router.use('*', (req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Error handler
router.use((err, req, res, next) => {
  console.error('❌ Необработанная ошибка:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

module.exports = router;
