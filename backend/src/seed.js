const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const courses = [
  {
    title: 'Базовые команды',
    description: 'Обучение ключевым командам: сидеть, лежать, стоять, ко мне. Идеально для щенков и взрослых собак, не имевших базовой подготовки.',
    difficulty: 'Начинающий',
    category: 'Базовые навыки',
    duration: '4 недели',
    rating: 4.8,
    is_active: true,
  },
  {
    title: 'Контроль поводка',
    description: 'Научите собаку ходить рядом без рывков. Разберём технику слабого поводка и команду "рядом" в разных условиях.',
    difficulty: 'Начинающий',
    category: 'Поведение на прогулке',
    duration: '3 недели',
    rating: 4.6,
    is_active: true,
  },
  {
    title: 'Социализация',
    description: 'Правила знакомства с людьми, другими животными и новыми местами. Снижение тревожности и агрессии через постепенное привыкание.',
    difficulty: 'Средний',
    category: 'Поведение',
    duration: '6 недель',
    rating: 4.9,
    is_active: true,
  },
  {
    title: 'Спортивная дрессировка',
    description: 'Элементы аджилити, фрисби и послушания. Для активных собак и владельцев, готовых к соревнованиям.',
    difficulty: 'Продвинутый',
    category: 'Спорт',
    duration: '8 недель',
    rating: 4.7,
    is_active: true,
  },
  {
    title: 'Коррекция поведения',
    description: 'Работа с нежелательным поведением: прыжки на людей, облаивание, попрошайничество, грызня вещей.',
    difficulty: 'Средний',
    category: 'Коррекция',
    duration: '5 недель',
    rating: 4.5,
    is_active: true,
  },
];

const tracks = [
  {
    title: 'Ежедневные команды',
    description: 'Повторяйте базовые команды каждый день по 10-15 минут. Регулярность — ключ к успеху.',
    category: 'Базовые навыки',
    difficulty: 'Начинающий',
    duration_days: 21,
    is_active: true,
  },
  {
    title: 'Прогулка без рывков',
    description: 'Практикуйте ходьбу на слабом поводке в парке или дворе. Начинайте с 10 минут, постепенно увеличивайте.',
    category: 'Поведение на прогулке',
    difficulty: 'Начинающий',
    duration_days: 14,
    is_active: true,
  },
  {
    title: 'Социальные встречи',
    description: 'Организуйте одну контролируемую встречу с другой собакой или незнакомым человеком.',
    category: 'Поведение',
    difficulty: 'Средний',
    duration_days: 30,
    is_active: true,
  },
];

const achievements = [
  {
    name: 'Первые шаги',
    description: 'Завершите первое задание трека',
    icon: 'Star',
    color: 'yellow',
    condition: JSON.stringify({ type: 'tracks_completed', value: 1 }),
  },
  {
    name: 'Неделя обучения',
    description: 'Занимайтесь 7 дней подряд',
    icon: 'Calendar',
    color: 'green',
    condition: JSON.stringify({ type: 'streak', value: 7 }),
  },
  {
    name: 'Мастер команд',
    description: 'Завершите 3 трека',
    icon: 'Target',
    color: 'blue',
    condition: JSON.stringify({ type: 'tracks_completed', value: 3 }),
  },
  {
    name: 'Друг питомца',
    description: 'Занимайтесь 30 дней подряд',
    icon: 'Heart',
    color: 'red',
    condition: JSON.stringify({ type: 'streak', value: 30 }),
  },
  {
    name: 'Эксперт',
    description: 'Завершите 5 треков',
    icon: 'Crown',
    color: 'purple',
    condition: JSON.stringify({ type: 'tracks_completed', value: 5 }),
  },
  {
    name: 'Молния',
    description: 'Завершите трек за 1 день',
    icon: 'Zap',
    color: 'orange',
    condition: JSON.stringify({ type: 'track_speed', value: 1 }),
  },
];

async function main() {
  console.log('🌱 Начало заполнения базы данных...');

  for (const course of courses) {
    await prisma.course.upsert({
      where: { id: courses.indexOf(course) + 1 },
      update: course,
      create: course,
    });
  }
  console.log(`✅ Создано курсов: ${courses.length}`);

  for (const track of tracks) {
    await prisma.track.upsert({
      where: { id: tracks.indexOf(track) + 1 },
      update: track,
      create: track,
    });
  }
  console.log(`✅ Создано треков: ${tracks.length}`);

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { id: achievements.indexOf(achievement) + 1 },
      update: achievement,
      create: achievement,
    });
  }
  console.log(`✅ Создано достижений: ${achievements.length}`);

  console.log('🎉 База данных заполнена успешно!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
