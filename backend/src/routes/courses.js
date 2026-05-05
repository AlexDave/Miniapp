const express = require('express');
const { prisma } = require('../database/connection');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const catalog = await prisma.course.findMany({
      where: { is_active: true, content: { contains: 'courses.json' } },
      orderBy: { id: 'asc' },
    });
    const courses =
      catalog.length > 0
        ? catalog
        : await prisma.course.findMany({
            where: { is_active: true },
            orderBy: { id: 'asc' },
          });
    res.json(courses);
  } catch (err) {
    logger.error({ err }, 'Ошибка при получении курсов');
    res.status(500).json({ error: 'Ошибка при получении курсов' });
  }
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Неверный ID курса' });
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: { tasks: { where: { is_active: true }, orderBy: { order_index: 'asc' } } },
    });

    if (!course) {
      return res.status(404).json({ error: 'Курс не найден' });
    }

    res.json(course);
  } catch (err) {
    logger.error({ err }, 'Ошибка при получении курса');
    res.status(500).json({ error: 'Ошибка при получении курса' });
  }
});

module.exports = router;
