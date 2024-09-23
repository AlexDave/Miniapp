require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI; // Убедитесь, что у вас правильно настроена переменная окружения MONGO_URI
const client = new MongoClient(uri);

const seedData = async () => {
  try {
    await client.connect();
    console.log('Подключение к MongoDB успешно');

    const db = client.db('myFirstDatabase'); // Убедитесь, что указана правильная база данных
    const usersCollection = db.collection('users');
    const coursesCollection = db.collection('courses');

    // Очищаем коллекции перед вставкой данных
    await usersCollection.deleteMany({});
    await coursesCollection.deleteMany({});

    // Пример данных для курса с заданиями (tracks)
    const courses = [
      {
        id: 1,
        title: 'Курс 1',
        description: 'Описание курса 1',
        videoUrl: 'https://www.youtube.com/embed/example1',
        content: 'Конспект курса 1.',
        tasks: [
          {
            trackId: 1,
            title: 'Задание 1',
            description: 'Описание задания 1',
            requiredPerDay: 5, // Сколько раз задание может быть выполнено в день
            completedToday: 0, // Сколько раз задание выполнено сегодня
            lastCompletedAt: null, // Последнее выполнение
            daysRemaining: 7 // Задание доступно 7 дней
          },
          {
            trackId: 2,
            title: 'Задание 2',
            description: 'Описание задания 2',
            requiredPerDay: 3, // Сколько раз задание может быть выполнено в день
            completedToday: 0, // Сколько раз задание выполнено сегодня
            lastCompletedAt: null, // Последнее выполнение
            daysRemaining: 5 // Задание доступно 5 дней
          }
        ]
      },
      {
        id: 2,
        title: 'Курс 2',
        description: 'Описание курса 2',
        videoUrl: 'https://www.youtube.com/embed/example2',
        content: 'Конспект курса 2.',
        tasks: [
          {
            trackId: 3,
            title: 'Задание 3',
            description: 'Описание задания 3',
            requiredPerDay: 4,
            completedToday: 0,
            lastCompletedAt: null,
            daysRemaining: 10
          }
        ]
      }
    ];

    // Вставляем курсы
    await coursesCollection.insertMany(courses);

    // Пример пользователя с треками (выполненными заданиями)
    const users = [
      {
        telegram_id: 'fake_telegram_id', // Пример заглушки для Telegram ID
        name: 'Test User',
        tracks: [
          {
            trackId: 1,
            title: 'Задание 1',
            requiredPerDay: 5,
            completedToday: 0,
            lastCompletedAt: null,
            daysRemaining: 7
          },
          {
            trackId: 2,
            title: 'Задание 2',
            requiredPerDay: 3,
            completedToday: 0,
            lastCompletedAt: null,
            daysRemaining: 5
          }
        ],
        created_at: new Date()
      }
    ];

    // Вставляем пользователя с треками
    await usersCollection.insertMany(users);

    console.log('Данные успешно добавлены');
  } catch (err) {
    console.error('Ошибка при заполнении базы данных:', err);
  } finally {
    await client.close();
    console.log('Подключение к MongoDB закрыто');
  }
};

seedData();
