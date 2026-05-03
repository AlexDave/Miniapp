const express = require('express');
const { logger, corsMiddleware, authMiddleware } = require('./middleware');
const {
  coursesRoutes,
  profileRoutes,
  achievementsRoutes,
  systemRoutes,
  lessonsRoutes,
  progressRoutes,
  skillsRoutes,
  userRoutesRoutes,
  adminRoutes,
  onboardingRoutes,
  paymentsRoutes,
  petsRoutes,
} = require('./routes');
const telegramWebhook = require('./routes/telegramWebhook');
const behaviorRoutes = require('./routes/behavior');
const mediaPublicRoutes = require('./routes/mediaPublic');

const app = express();

app.use(logger);
app.use(express.json());
app.use(corsMiddleware);

// Системные маршруты без аутентификации
app.use('/', systemRoutes);
// Telegram Bot: updates (без Telegram initData)
app.use('/telegram', telegramWebhook);

// Админ (ключ X-Admin-Key), до общего auth Telegram
app.use('/api/admin', adminRoutes);

// Видео-трофеи: раздача по подписанному URL (без Telegram initData для <video>)
app.use('/api/media', mediaPublicRoutes);

// API маршруты — требуют аутентификации
app.use('/api', authMiddleware);
app.use('/api/courses', coursesRoutes);
app.use('/api/user/profile', profileRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/user/achievements', achievementsRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/routes', userRoutesRoutes);
app.use('/api/user', progressRoutes);
app.use('/api/behavior', behaviorRoutes);

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
