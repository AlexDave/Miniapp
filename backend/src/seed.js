const { PrismaClient } = require('@prisma/client');
const { courses, modulesData } = require('./seed-content');

const prisma = new PrismaClient();

// ─── Треки (ежедневные привычки) ──────────────────────────────────────────────

const tracks = [
  { title: 'Ежедневные команды', description: 'Повторяйте базовые команды каждый день по 5–10 минут. Регулярность — ключ к успеху.', category: 'Базовые навыки', difficulty: 'Начинающий', duration_days: 21, is_active: true },
  { title: 'Прогулка без рывков', description: 'Метод «стоп-и-жди» — каждый раз когда поводок натягивается. 14 дней практики.', category: 'Поведение на прогулке', difficulty: 'Начинающий', duration_days: 14, is_active: true },
  { title: 'Социализация', description: 'Каждый день — одно новое место, человек или звук. 30 дней постепенной адаптации.', category: 'Поведение', difficulty: 'Средний', duration_days: 30, is_active: true },
];

// ─── Достижения ───────────────────────────────────────────────────────────────

const achievements = [
  { name: 'Первые шаги', description: 'Завершите первое задание трека', icon: 'Star', color: 'yellow', condition: JSON.stringify({ type: 'tracks_completed', value: 1 }) },
  { name: 'Неделя обучения', description: 'Занимайтесь 7 дней подряд', icon: 'Calendar', color: 'green', condition: JSON.stringify({ type: 'streak', value: 7 }) },
  { name: 'Мастер команд', description: 'Завершите 3 трека', icon: 'Target', color: 'blue', condition: JSON.stringify({ type: 'tracks_completed', value: 3 }) },
  { name: 'Друг питомца', description: 'Занимайтесь 30 дней подряд', icon: 'Heart', color: 'red', condition: JSON.stringify({ type: 'streak', value: 30 }) },
  { name: 'Эксперт', description: 'Завершите 5 треков', icon: 'Crown', color: 'purple', condition: JSON.stringify({ type: 'tracks_completed', value: 5 }) },
  { name: 'Молния', description: 'Завершите трек за 1 день', icon: 'Zap', color: 'orange', condition: JSON.stringify({ type: 'track_speed', value: 1 }) },
  { name: 'Данные не врут', description: 'Заполняй отчёт 10 дней подряд', icon: 'BarChart', color: 'teal', condition: JSON.stringify({ type: 'reports_streak', value: 10 }) },
  { name: 'Перфекционист', description: 'Получи оценку «Отлично» 5 раз', icon: 'Award', color: 'yellow', condition: JSON.stringify({ type: 'perfect_reports', value: 5 }) },
  { name: 'Первый модуль', description: 'Завершил первый модуль курса', icon: 'BookOpen', color: 'blue', condition: JSON.stringify({ type: 'modules_complete', value: 1 }) },
];

// ─── Заполнение БД ────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Начало заполнения базы данных...');

  // Деактивируем все старые курсы (тестовые/выдуманные)
  await prisma.course.updateMany({ data: { is_active: false } });
  console.log('🔄 Старые курсы деактивированы');

  // Курсы — два реальных
  const createdCourses = {};
  for (const course of courses) {
    const existing = await prisma.course.findFirst({ where: { title: course.title } });
    let saved;
    if (existing) {
      saved = await prisma.course.update({
        where: { id: existing.id },
        data: { ...course, is_active: true },
      });
    } else {
      saved = await prisma.course.create({ data: { ...course, is_active: true } });
    }
    createdCourses[saved.title] = saved;
  }
  console.log(`✅ Курсов: ${courses.length}`);

  // Модули и уроки
  let totalLessons = 0;
  for (const [courseTitle, modules] of Object.entries(modulesData)) {
    const course = createdCourses[courseTitle];
    if (!course) continue;

    for (const moduleData of modules) {
      const { lessons, ...moduleFields } = moduleData;

      let module = await prisma.module.findFirst({
        where: { course_id: course.id, order_index: moduleFields.order_index },
      });
      if (module) {
        module = await prisma.module.update({ where: { id: module.id }, data: moduleFields });
      } else {
        module = await prisma.module.create({ data: { ...moduleFields, course_id: course.id } });
      }

      for (const lessonData of lessons) {
        const { steps, daily_task, ...lessonFields } = lessonData;

        let lesson = await prisma.lesson.findFirst({
          where: { module_id: module.id, order_index: lessonFields.order_index },
        });
        if (lesson) {
          lesson = await prisma.lesson.update({ where: { id: lesson.id }, data: lessonFields });
        } else {
          lesson = await prisma.lesson.create({ data: { ...lessonFields, module_id: module.id } });
        }
        totalLessons++;

        // Шаги теории — пересоздаём, чтобы порядок и содержание было актуальным
        await prisma.lessonStep.deleteMany({ where: { lesson_id: lesson.id } });
        if (steps && steps.length > 0) {
          await prisma.lessonStep.createMany({
            data: steps.map((s, i) => ({ ...s, lesson_id: lesson.id, order_index: i })),
          });
        }

        // Задание дня
        if (daily_task) {
          const { steps: taskSteps, ...taskFields } = daily_task;
          let task = await prisma.dailyTask.findUnique({ where: { lesson_id: lesson.id } });
          if (task) {
            await prisma.dailyTask.update({ where: { id: task.id }, data: taskFields });
            await prisma.taskStep.deleteMany({ where: { task_id: task.id } });
          } else {
            task = await prisma.dailyTask.create({ data: { ...taskFields, lesson_id: lesson.id } });
          }
          if (taskSteps && taskSteps.length > 0) {
            await prisma.taskStep.createMany({
              data: taskSteps.map((s, i) => ({ ...s, task_id: task.id, order_index: i })),
            });
          }
        }
      }
    }
  }
  console.log(`✅ Модули и уроки созданы: ${totalLessons} уроков`);

  // Треки
  for (const track of tracks) {
    const existing = await prisma.track.findFirst({ where: { title: track.title } });
    if (existing) {
      await prisma.track.update({ where: { id: existing.id }, data: track });
    } else {
      await prisma.track.create({ data: track });
    }
  }
  console.log(`✅ Треков: ${tracks.length}`);

  // Достижения
  for (const achievement of achievements) {
    const existing = await prisma.achievement.findFirst({ where: { name: achievement.name } });
    if (existing) {
      await prisma.achievement.update({ where: { id: existing.id }, data: achievement });
    } else {
      await prisma.achievement.create({ data: achievement });
    }
  }
  console.log(`✅ Достижений: ${achievements.length}`);

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
