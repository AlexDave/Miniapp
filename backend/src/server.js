require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = 5000;

// Строка подключения к MongoDB Atlas
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

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
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(bodyParser.json());

// Заглушка для Telegram ID (в реальном приложении сюда нужно интегрировать реальный Telegram ID)
app.use(async (req, res, next) => {
  const telegram_id = 'fake_telegram_id'; // В реальном приложении этот ID должен приходить из Telegram
  const name = 'Test User'; // Имя пользователя

  // Проверка, существует ли пользователь с данным Telegram ID
  try {
    const db = await dbPromise;
    let user = await db.collection('users').findOne({ telegram_id });

    // Если пользователь не найден, регистрируем его
    if (!user) {
      user = {
        telegram_id,
        name,
        viewed_courses: [], // Список просмотренных курсов
        tracks: [], // Треки пользователя
        created_at: new Date()
      };
      await db.collection('users').insertOne(user);
      console.log('Пользователь зарегистрирован:', user);
    } else {
      console.log('Пользователь найден:', user);
    }

    // Сохраняем информацию о пользователе в запросе
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
    const courseId = parseInt(req.params.id); // Преобразуем ID в число
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

app.post('/api/user/tracks', async (req, res) => {
  const { track } = req.body;

  try {
    const db = await dbPromise;
    const user = await db.collection('users').findOne({ telegram_id: req.user.telegram_id });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Добавляем трек в список треков пользователя
    await db.collection('users').updateOne(
      { telegram_id: req.user.telegram_id },
      { $push: { tracks: track } }
    );

    res.json({ message: 'Трек добавлен' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при добавлении трека' });
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

    // Возвращаем треки пользователя
    const tracks = user.tracks || [];
    res.json(tracks);
  } catch (err) {
    console.error('Ошибка при получении треков пользователя:', err);
    res.status(500).json({ error: 'Ошибка при получении треков пользователя' });
  }
});

// API для выполнения задания
app.put('/api/user/tracks/:trackId', async (req, res) => {
  const { trackId } = req.params;

  try {
    const db = await dbPromise;
    const user = await db.collection('users').findOne({ telegram_id: req.user.telegram_id });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Находим трек по trackId
    const track = user.tracks.find(t => t.trackId === parseInt(trackId));

    if (!track) {
      return res.status(404).json({ error: 'Трек не найден' });
    }

    const currentTime = new Date();
    const timeDifference = track.lastCompletedAt ? Math.floor((currentTime - new Date(track.lastCompletedAt)) / 60000) : null;

    // Проверяем, прошло ли достаточно времени для повторного выполнения
    if (timeDifference !== null && timeDifference < 15) {
      return res.status(400).json({ error: 'Ещё рано выполнять задание, подождите 15 минут.' });
    }

    // Проверяем, доступно ли выполнение на сегодня
    if (track.completedToday >= track.requiredPerDay) {
      return res.status(400).json({ error: 'Задание уже выполнено максимальное количество раз за сегодня.' });
    }

    // Обновляем выполнение трека
    track.completedToday += 1;
    track.lastCompletedAt = currentTime;

    await db.collection('users').updateOne(
      { telegram_id: req.user.telegram_id, 'tracks.trackId': track.trackId },
      { $set: { 'tracks.$': track } }
    );

    res.json({ message: 'Задание выполнено', track });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при выполнении задания' });
  }
});


// API для получения данных о пользователе
app.get('/api/user/data', async (req, res) => {
  try {
    const db = await dbPromise;
    const user = await db.collection('users').findOne({ telegram_id: req.user.telegram_id });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Возвращаем данные пользователя, включая просмотренные курсы и треки
    res.json({
      user: {
        telegram_id: user.telegram_id,
        name: user.name,
        viewed_courses: user.viewed_courses,
        tracks: user.tracks
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении данных пользователя' });
  }
});


// API для добавления просмотренного курса
app.post('/api/user/courses', async (req, res) => {
  const { courseId } = req.body;

  try {
    const db = await dbPromise;
    const user = await db.collection('users').findOne({ telegram_id: req.user.telegram_id });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Проверяем, уже ли курс был просмотрен
    if (!user.viewed_courses.includes(courseId)) {
      // Добавляем курс в список просмотренных курсов
      await db.collection('users').updateOne(
        { telegram_id: req.user.telegram_id },
        { $push: { viewed_courses: courseId } }
      );
    }

    res.json({ message: 'Курс добавлен в список просмотренных' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при добавлении просмотренного курса' });
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

    // Добавляем трек в список треков пользователя
    await db.collection('users').updateOne(
      { telegram_id: req.user.telegram_id },
      { $push: { tracks: track } }
    );

    res.json({ message: 'Трек добавлен' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при добавлении трека' });
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
