const express = require('express');
const { logger, corsMiddleware, authMiddleware } = require('./middleware');
const { coursesRoutes, tracksRoutes, profileRoutes, achievementsRoutes, systemRoutes } = require('./routes');

const app = express();

app.use(logger);
app.use(express.json());
app.use(corsMiddleware);

// Системные маршруты без аутентификации
app.use('/', systemRoutes);

// API маршруты — требуют аутентификации
app.use('/api', authMiddleware);
app.use('/api/courses', coursesRoutes);
app.use('/api/user/tracks', tracksRoutes);
app.use('/api/user/profile', profileRoutes);
app.use('/api/user/achievements', achievementsRoutes);

// 404 для неизвестных маршрутов
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error('❌ Необработанная ошибка:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

module.exports = app;
