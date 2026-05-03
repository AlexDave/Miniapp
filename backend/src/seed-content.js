// Контент курсов из backend/data/gpt_coures.json (GPT-структура: дни → уроки)

const gptData = require('../data/gpt_coures.json');

const DIFFICULTY_MAP = {
  easy: 'Начинающий',
  medium: 'Средний',
  hard: 'Сложный',
};

const baseTaskSteps = (extra = []) => [
  ...extra,
  { type: 'rating', label: 'Как прошло сегодня?' },
];

function inferSkillFromDay(d) {
  if (d.skill) return d.skill;
  const s = `${d.title} ${d.goal}`.toLowerCase();
  if (s.includes('ко мне') || s.includes('отзыв') || s.includes('подход')) return 'recall';
  if (s.includes('сидеть') || s.includes('лежать')) return 'sit';
  if (s.includes('туалет') || s.includes('одиночество') || s.includes('имя')) return 'focus';
  return 'focus';
}

function lessonFromDay(d) {
  const badges = [];
  if (d.badge) badges.push(`**Награда:** ${d.badge}`);
  if (d.combo) badges.push('*Комбо: несколько навыков за одну сессию*');

  const skill = inferSkillFromDay(d);
  const why =
    d.why ??
    (skill === 'recall'
      ? 'Укрепляет отзыв и контакт с хозяином.'
      : skill === 'sit'
        ? 'Базовая позиция для других команд.'
        : 'Формирует внимание к хозяину и управляемость.');

  const meta = {
    day_id: d.id ?? `day_${d.day}`,
    why,
    reflection: d.reflection !== false,
    fallback_tasks: Array.isArray(d.fallback_tasks)
      ? d.fallback_tasks
      : ['Сделай упражнение в тихой комнате', 'Сократи сессию до 2–3 минут'],
    skill,
    difficulty: typeof d.difficulty === 'number' ? d.difficulty : 1,
    progress_gain: typeof d.progress_gain === 'number' ? d.progress_gain : 10,
    success_message: d.success_message ?? 'Отлично! 🎉',
    partial_message: d.partial_message ?? 'Почти получилось 💪',
    fail_message: d.fail_message ?? 'Попробуй проще — без отвлечений.',
  };

  const theoryParts = [
    `## Цель дня\n\n${d.goal}`,
    meta.why ? `\n### Зачем\n\n${meta.why}` : '',
    '\n### Шаги',
    ...d.tasks.map((t) => `- ${t}`),
  ];
  if (badges.length) theoryParts.push('', ...badges);

  const taskCheckboxes = d.tasks.map((t) => ({ type: 'checkbox', label: t }));

  return {
    title: `День ${d.day}: ${d.title}`,
    description: d.goal,
    theory: theoryParts.join('\n'),
    xp_reward: d.xp,
    order_index: d.day,
    meta: JSON.stringify(meta),
    steps: d.tasks.map((t) => ({ type: 'card', content: t })),
    daily_task: {
      title: d.title,
      description: d.goal,
      duration_min: d.time_minutes,
      steps: baseTaskSteps(taskCheckboxes),
    },
  };
}

const defaultSkillTree = {
  unlock: [
    { lesson_order: 3, requires: { focus: 10 } },
    { lesson_order: 4, requires: { focus: 20 } },
    { lesson_order: 7, requires: { sit: 15 } },
  ],
};

const courses = gptData.courses.map((c) => ({
  title: c.title,
  description: c.description,
  difficulty: DIFFICULTY_MAP[c.difficulty] || 'Начинающий',
  category: 'Дрессировка',
  duration: `${c.duration_days} дней`,
  rating: 4.8,
  content: JSON.stringify({
    sourceId: c.id,
    skill_tree: c.skill_tree ?? defaultSkillTree,
    defaults: gptData.defaults ?? {},
  }),
}));

const modulesData = {};
for (const c of gptData.courses) {
  modulesData[c.title] = [
    {
      title: 'Программа по дням',
      description: 'Навыки и шаги — прогресс не только по «дням», но и по навыкам.',
      order_index: 1,
      lessons: c.days.map(lessonFromDay),
    },
  ];
}

module.exports = { courses, modulesData };
