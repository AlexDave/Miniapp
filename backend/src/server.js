const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

let courses = [
  {
    id: 1,
    title: 'Курс 1',
    description: 'Описание курса 1',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content: 'Конспект курса 1.',
    tasks: [
      { id: 1, title: 'Задание 1', description: 'Описание задания 1' },
      { id: 2, title: 'Задание 2', description: 'Описание задания 2' }
    ]
  },
  // Другие курсы
];

let tracks = []; // Массив для треков (добавленных задач)

// Получение всех курсов
app.get('/api/courses', (req, res) => {
  res.json(courses);
});

// Получение конкретного курса по ID
app.get('/api/courses/:id', (req, res) => {
  const course = courses.find(c => c.id === parseInt(req.params.id));
  if (course) {
    res.json(course);
  } else {
    res.status(404).send('Курс не найден');
  }
});

// Добавление задачи из курса в трек
app.post('/api/tracks', (req, res) => {
  const { task, courseId } = req.body;
  const track = { ...task, courseId, progress: 0, completed: false, trackId: tracks.length + 1 };
  tracks.push(track);
  res.status(201).json(track);
});

// Получение всех треков (задач)
app.get('/api/tracks', (req, res) => {
  res.json(tracks);
});

// Обновление задачи в треке (прогресс и статус выполнения)
app.put('/api/tracks/:trackId', (req, res) => {
  const track = tracks.find(t => t.trackId === parseInt(req.params.trackId));
  if (track) {
    track.progress = req.body.progress;
    track.completed = req.body.completed;
    res.json(track);
  } else {
    res.status(404).send('Задание не найдено');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
