const database = require('../database/connection');
const config = require('../config');

const authMiddleware = async (req, res, next) => {
  const telegram_id = config.app.telegramId; // В реальном приложении этот ID должен приходить из Telegram
  const name = config.app.userName; // Имя пользователя

  try {
    let user = await database.findOne('users', { telegram_id });

    if (!user) {
      user = {
        telegram_id,
        name,
        viewed_courses: [],
        tracks: [],
        created_at: new Date(),
      };
      await database.insertOne('users', user);
      console.log('👤 Пользователь зарегистрирован:', user.name);
    } else {
      console.log('👤 Пользователь найден:', user.name);
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('❌ Ошибка при проверке или регистрации пользователя:', err);
    res.status(500).json({ error: 'Ошибка при проверке или регистрации пользователя' });
  }
};

module.exports = authMiddleware;
