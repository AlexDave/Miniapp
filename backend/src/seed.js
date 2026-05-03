const { PrismaClient } = require('@prisma/client');
const { courses, modulesData } = require('./seed-content');
const { SKILL_CATEGORIES, SKILLS } = require('./seed-skills');
const ATOMIC_OUTCOMES = require('../data/skill-atomic-outcomes.json');

const prisma = new PrismaClient();

// ─── Треки (ежедневные привычки) ──────────────────────────────────────────────

const tracks = [
  { title: 'Ежедневные команды', description: 'Повторяйте базовые команды каждый день по 5–10 минут. Регулярность — ключ к успеху.', category: 'Базовые навыки', difficulty: 'Начинающий', duration_days: 21, is_active: true },
  { title: 'Прогулка без рывков', description: 'Метод «стоп-и-жди» — каждый раз когда поводок натягивается. 14 дней практики.', category: 'Поведение на прогулке', difficulty: 'Начинающий', duration_days: 14, is_active: true },
  { title: 'Социализация', description: 'Каждый день — одно новое место, человек или звук. 30 дней постепенной адаптации.', category: 'Поведение', difficulty: 'Средний', duration_days: 30, is_active: true },
];

// ─── Достижения ───────────────────────────────────────────────────────────────

const achievements = [
  { name: 'Первые шаги', description: 'Первый прогресс по атому в текущем маршруте', icon: 'Star', color: 'yellow', condition: JSON.stringify({ type: 'routes_completed', value: 1 }) },
  { name: 'Неделя обучения', description: 'Занимайтесь 7 дней подряд', icon: 'Calendar', color: 'green', condition: JSON.stringify({ type: 'streak', value: 7 }) },
  { name: 'Мастер команд', description: 'Три атома маршрута с практикой (косточки)', icon: 'Target', color: 'blue', condition: JSON.stringify({ type: 'routes_completed', value: 3 }) },
  { name: 'Друг питомца', description: 'Занимайтесь 30 дней подряд', icon: 'Heart', color: 'red', condition: JSON.stringify({ type: 'streak', value: 30 }) },
  { name: 'Эксперт', description: 'Пять атомов маршрута с практикой', icon: 'Crown', color: 'purple', condition: JSON.stringify({ type: 'routes_completed', value: 5 }) },
  { name: 'Молния', description: 'Сделайте 5 отчётов по урокам', icon: 'Zap', color: 'orange', condition: JSON.stringify({ type: 'reports_count', value: 5 }) },
  { name: 'Данные не врут', description: 'Заполняй отчёт 10 дней подряд', icon: 'BarChart', color: 'teal', condition: JSON.stringify({ type: 'reports_streak', value: 10 }) },
  { name: 'Перфекционист', description: 'Соберите 15 косточек всего', icon: 'Award', color: 'yellow', condition: JSON.stringify({ type: 'bones_earned', value: 15 }) },
  { name: 'Первый модуль', description: 'Завершил первый модуль курса', icon: 'BookOpen', color: 'blue', condition: JSON.stringify({ type: 'modules_complete', value: 1 }) },
  { name: 'Мастер курса', description: 'Завершил курс от первого до последнего урока', icon: 'GraduationCap', color: 'purple', condition: JSON.stringify({ type: 'course_completed', value: 1 }) },
];

// ─── Заполнение БД ────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Начало заполнения базы данных...');

  // Удаляем все курсы (каскадом модули, уроки, задачи курса и связанный прогресс)
  const deletedCourses = await prisma.course.deleteMany({});
  console.log(`🗑 Удалено курсов из БД: ${deletedCourses.count}`);

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

  // Категории и атомы навыков
  for (const cat of SKILL_CATEGORIES) {
    const existing = await prisma.skillCategory.findUnique({ where: { key: cat.key } });
    if (existing) {
      await prisma.skillCategory.update({ where: { key: cat.key }, data: cat });
    } else {
      await prisma.skillCategory.create({ data: cat });
    }
  }
  for (const skill of SKILLS) {
    const data = {
      ...skill,
      atomic_outcome: ATOMIC_OUTCOMES[skill.key] ?? null,
    };
    const existing = await prisma.skill.findUnique({ where: { key: skill.key } });
    if (existing) {
      await prisma.skill.update({ where: { key: skill.key }, data });
    } else {
      await prisma.skill.create({ data });
    }
  }
  console.log(`✅ Категорий навыков: ${SKILL_CATEGORIES.length}, атомов: ${SKILLS.length}`);

  // Маршруты
  const ROUTES = [
    {
      key: 'puppy-basics',
      title: 'Щенок с нуля',
      description: 'Первые 3 месяца: имя, туалет, контакт и базовая команда',
      icon: '🐶',
      target_problem: 'new_puppy',
      age_min_months: 0,
      age_max_months: 6,
      order_index: 0,
      skills: ['intro.name', 'intro.eye', 'daily.toilet', 'daily.sleep', 'control.sit', 'walk.recall'],
    },
    {
      key: 'city-dog',
      title: 'Городская собака',
      description: 'Социализация, прогулки без рывков, безопасный подзыв',
      icon: '🏙️',
      target_problem: 'pulling',
      age_min_months: 4,
      age_max_months: null,
      order_index: 1,
      requires_pro: true,
      skills: ['social.people', 'social.sounds', 'walk.loose', 'walk.heel', 'walk.recall', 'walk.recall2', 'walk.drop'],
    },
    {
      key: 'foundations',
      title: 'Основы послушания',
      description: 'Сидеть, лежать, ждать — фундамент управляемости',
      icon: '✋',
      target_problem: 'no_commands',
      age_min_months: 3,
      age_max_months: null,
      order_index: 2,
      skills: ['intro.eye', 'control.sit', 'control.down', 'control.wait', 'control.place', 'bound.no'],
    },
    {
      key: 'calm-home',
      title: 'Спокойный дома',
      description: 'Одиночество, лай, режим — собака без тревоги',
      icon: '🏠',
      target_problem: 'separation_anxiety',
      age_min_months: 4,
      age_max_months: null,
      order_index: 3,
      requires_pro: true,
      skills: ['daily.sleep', 'bound.bark', 'bound.bite', 'self.alone', 'self.tired'],
    },
  ];

  for (const route of ROUTES) {
    const { skills: skillKeys, ...routeFields } = route;
    let savedRoute = await prisma.route.findUnique({ where: { key: routeFields.key } });
    if (savedRoute) {
      await prisma.route.update({ where: { key: routeFields.key }, data: routeFields });
    } else {
      savedRoute = await prisma.route.create({ data: routeFields });
    }
    // Пересоздаём привязки навыков
    await prisma.routeSkill.deleteMany({ where: { route_id: savedRoute.id } });
    await prisma.routeSkill.createMany({
      data: skillKeys.map((sk, i) => ({
        route_id: savedRoute.id,
        skill_key: sk,
        order_index: i,
        is_required: true,
      })),
    });
  }
  console.log(`✅ Маршрутов: ${ROUTES.length}`);

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
