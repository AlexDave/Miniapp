const express = require('express');
const database = require('../database/connection');
const { isValidId } = require('../utils/validation');

const router = express.Router();

// API для получения списка курсов
router.get('/', async (req, res) => {
  try {
    const courses = await database.find('courses');

    if (!courses.length) {
      return res.status(404).json({ error: 'Курсы не найдены' });
    }

    res.json(courses);
  } catch (err) {
    console.error('❌ Ошибка при получении курсов:', err.message);
    res.status(500).json({ error: 'Ошибка при получении курсов' });
  }
});

// API для получения курса по ID
router.get('/:id', async (req, res) => {
  try {
    const courseId = req.params.id;
    
    if (!isValidId(courseId)) {
      return res.status(400).json({ error: 'Неверный ID курса' });
    }

    const course = await database.findOne('courses', { id: parseInt(courseId) });

    if (!course) {
      return res.status(404).json({ error: 'Курс не найден' });
    }

    res.json(course);
  } catch (err) {
    console.error('❌ Ошибка при получении курса по ID:', err.message);
    res.status(500).json({ error: 'Ошибка при получении курса' });
  }
});

module.exports = router;
