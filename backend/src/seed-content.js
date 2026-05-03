// Контент курсов из backend/data/atomic-lessons.json (атомы → уроки БД)

const atomic = require('../data/atomic-lessons.json');

const DIFFICULTY_MAP = {
  easy: 'Начинающий',
  medium: 'Средний',
  hard: 'Сложный',
};

const baseTaskSteps = (extra = []) => [
  ...extra,
  { type: 'rating', label: 'Как прошло сегодня?' },
];

const defaultSkillTree = {
  unlock: [
    { lesson_order: 3, requires: { focus: 10 } },
    { lesson_order: 4, requires: { focus: 20 } },
    { lesson_order: 7, requires: { sit: 15 } },
  ],
};

function lessonFromAtomic(al) {
  const meta = {
    day_id: al.source_day_id,
    why: al.why,
    reflection: true,
    fallback_tasks: al.fallback_tasks,
    skill_key: al.skill_key,
    skill: al.legacy_skill,
    difficulty: 1,
    progress_gain: 10,
    success_message: 'Отлично! 🎉',
    partial_message: 'Почти получилось 💪',
    fail_message: 'Попробуй проще — без отвлечений.',
  };
  if (al.video_url) meta.video_url = al.video_url;
  if (al.badge) meta.badge = al.badge;
  if (al.combo) meta.combo = true;

  const theoryParts = [
    `## Цель дня\n\n${al.goal}`,
    `\n### Зачем\n\n${al.why}`,
    '\n### Как — три шага',
    ...al.how_steps.map((s, i) => `${i + 1}. ${s}`),
  ];
  if (al.badge) theoryParts.push('', `**Награда:** ${al.badge}`);
  if (al.combo) theoryParts.push('*Комбо: несколько навыков за одну сессию*');

  const taskCheckboxes = al.task_checkboxes.map((t) => ({ type: 'checkbox', label: t }));

  return {
    title: `День ${al.day}: ${al.title}`,
    description: al.goal,
    theory: theoryParts.join('\n'),
    xp_reward: al.xp,
    order_index: al.day,
    meta: JSON.stringify(meta),
    steps: al.how_steps.map((t) => ({ type: 'card', content: t })),
    daily_task: {
      title: al.title,
      description: al.goal,
      duration_min: al.time_minutes,
      steps: baseTaskSteps(taskCheckboxes),
    },
  };
}

const courseOrder = [...new Set(atomic.lessons.map((l) => l.course_title))];
const metaByTitle = Object.fromEntries((atomic.courses || []).map((c) => [c.title, c]));

const courses = courseOrder.map((title) => {
  const cm = metaByTitle[title];
  return {
    title,
    description: cm?.description ?? 'Программа тренировок',
    difficulty: DIFFICULTY_MAP[cm?.difficulty] || 'Начинающий',
    category: 'Дрессировка',
    duration: cm?.duration_days ? `${cm.duration_days} дней` : 'по дням',
    rating: 4.8,
    content: JSON.stringify({
      sourceId: cm?.id ?? title,
      skill_tree: defaultSkillTree,
      defaults: atomic.defaults ?? {},
    }),
  };
});

const modulesData = {};
for (const title of courseOrder) {
  const lessonsForCourse = atomic.lessons.filter((l) => l.course_title === title);
  modulesData[title] = [
    {
      title: 'Программа по дням',
      description: 'Навыки и шаги — прогресс не только по «дням», но и по атомам (skill_key).',
      order_index: 1,
      lessons: lessonsForCourse.map(lessonFromAtomic),
    },
  ];
}

module.exports = { courses, modulesData };
