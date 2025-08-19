const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const { logger, corsMiddleware, authMiddleware } = require('./middleware');

// Импорт маршрутов
const { coursesRoutes, tracksRoutes, systemRoutes } = require('./routes');

const app = express();

// Middleware
app.use(logger);
app.use(bodyParser.json());
app.use(corsMiddleware);

// Аутентификация пользователя
app.use(authMiddleware);

// Маршруты API
app.use('/api/courses', coursesRoutes);
app.use('/api/user/tracks', tracksRoutes);

// Системные маршруты (health check, 404, error handling)
app.use('/', systemRoutes);

module.exports = app;
