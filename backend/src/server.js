require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const TelegramBot = require('node-telegram-bot-api'); // Telegram bot library

const app = express();
const port = 5000;

// Строка подключения к MongoDB Atlas
const uri = process.env.MONGO_URI;
const server_ip = process.env.server_ip;
const client = new MongoClient(uri);

// Инициализация Telegram-бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Функция для подключения к MongoDB
async function connectDB() {
  try {
    await client.connect();
    console.log('Подключение к MongoDB успешно');
    return client.db('myFirstDatabase'); // Подключение к базе данных
  } catch (err) {
    console.error('Ошибка подключения к MongoDB:', err);
  }
}

const dbPromise = connectDB(); // Обещание для подключения к базе данных

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin || // Разрешить запросы без origin
      /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin) || // Локальная сеть с любым портом
      /^http:\/\/localhost(:\d+)?$/.test(origin) // Локальный хост с любым портом
    ) {
      callback(null, true);
    } else {
      callback(new Error('Запрос с этого источника запрещён CORS'));
    }
  },
  credentials: true
}));


// Заглушка для Telegram ID
app.use(async (req, res, next) => {
  const telegram_id = 'fake_telegram_id'; // В реальном приложении этот ID должен приходить из Telegram
  const name = 'Test User'; // Имя пользователя

  try {
    const db = await dbPromise;
    let user = await db.collection('users').findOne({ telegram_id });

    if (!user) {
      user = {
        telegram_id,
        name,
        viewed_courses: [],
        tracks: [],
        created_at: new Date(),
      };
      await db.collection('users').insertOne(user);
      console.log('Пользователь зарегистрирован:', user);
    } else {
      console.log('Пользователь найден:', user);
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Ошибка при проверке или регистрации пользователя:', err);
    res.status(500).json({ error: 'Ошибка при проверке или регистрации пользователя' });
  }
});

// API для получения списка курсов
app.get('/api/courses', async (req, res) => {
  try {
    const db = await dbPromise;
    const courses = await db.collection('courses').find({}).toArray();

    if (!courses.length) {
      return res.status(404).json({ error: 'Курсы не найдены' });
    }

    res.json(courses);
  } catch (err) {
    console.error('Ошибка при получении курсов:', err.message);
    res.status(500).json({ error: 'Ошибка при получении курсов' });
  }
});

// API для получения курса по ID
app.get('/api/courses/:id', async (req, res) => {
  try {
    const db = await dbPromise;
    const courseId = parseInt(req.params.id); 
    const course = await db.collection('courses').findOne({ id: courseId });

    if (!course) {
      return res.status(404).json({ error: 'Курс не найден' });
    }

    res.json(course);
  } catch (err) {
    console.error('Ошибка при получении курса по ID:', err.message);
    res.status(500).json({ error: 'Ошибка при получении курса' });
  }
});

// API для добавления трека пользователя
app.post('/api/user/tracks', async (req, res) => {
  const { track } = req.body;

  try {
    const db = await dbPromise;
    const user = await db.collection('users').findOne({ telegram_id: req.user.telegram_id });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    await db.collection('users').updateOne(
      { telegram_id: req.user.telegram_id },
      { $push: { tracks: track } }
    );

    res.json({ message: 'Трек добавлен' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при добавлении трека' });
  }
});

// API для удаления трека
app.delete('/api/user/tracks/:trackId', async (req, res) => {
  const { trackId } = req.params;

  try {
    const db = await dbPromise;
    const result = await db.collection('users').updateOne(
      { telegram_id: req.user.telegram_id },
      { $pull: { tracks: { trackId: parseInt(trackId) } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Трек не найден или уже удалён' });
    }

    res.json({ message: 'Трек удалён' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при удалении трека' });
  }
});

// API для выполнения задания и обновления трека
app.put('/api/user/tracks/:trackId', async (req, res) => {
  const { trackId } = req.params;

  try {
    const db = await dbPromise;
    const user = await db.collection('users').findOne({ telegram_id: req.user.telegram_id });

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

    await db.collection('users').updateOne(
      { telegram_id: req.user.telegram_id, 'tracks.trackId': track.trackId },
      { $set: { 'tracks.$': track } }
    );

    res.json({ message: 'Задание выполнено', track });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при выполнении задания' });
  }
});

// API для получения треков пользователя
app.get('/api/user/tracks', async (req, res) => {
  try {
    const db = await dbPromise;
    const user = await db.collection('users').findOne({ telegram_id: req.user.telegram_id });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const tracks = user.tracks || [];
    res.json(tracks);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении треков пользователя' });
  }
});
// Обработка команды /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  // Приветственное сообщение с кнопкой для открытия мини-приложения
  const welcomeMessage = 'Привет! Я помогу тебе открыть мини-приложение. Нажми на кнопку ниже, чтобы открыть приложение.';

  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Открыть приложение', // Текст на кнопке
            url: 'http://test.ru/miniapp', // Ссылка на мини-приложение
          },
        ],
      ],
    },
  };

  try {
    // Отправляем приветственное сообщение с кнопкой
    await bot.sendMessage(chatId, welcomeMessage, options);
  } catch (err) {
    console.error('Ошибка при отправке приветственного сообщения:', err);
  }
});

// Обработка команды /openMiniApp
bot.onText(/\/openMiniApp/, async (msg) => {
  const chatId = msg.chat.id;

  // Отправляем сообщение о запуске мини-приложения с кнопкой
  const openMessage = 'Открываю мини-приложение!';
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Открыть приложение', // Текст на кнопке
            url: 'http://test.ru/miniapp', // Ссылка на мини-приложение
          },
        ],
      ],
    },
  };

  try {
    await bot.sendMessage(chatId, openMessage, options);
  } catch (err) {
    console.error('Ошибка при отправке сообщения с кнопкой:', err);
  }
});

// Запуск сервера
app.listen(port,server_ip, () => {
  console.log(`Server running at ${port}`);
});
