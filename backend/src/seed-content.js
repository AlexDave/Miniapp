// Контент курсов из backend/data/atomic-lessons.json (атомы → уроки БД)

const atomic = require('../data/atomic-lessons.json');
const { buildFallbackTreePayload } = require('./utils/fallbackTree');

const DIFFICULTY_MAP = {
  easy: 'Начинающий',
  medium: 'Средний',
  hard: 'Сложный',
};

/** Демо-ролик для DoD «≥1 шаг с видео» (замените на свои MP4/WebM в `public/lesson-media/`). */
const LESSON_DEMO_VIDEO_URL =
  process.env.LESSON_DEMO_VIDEO_URL ||
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

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

// ─── Маппинг типов theory_block → LessonStep.type ───────────────────────────
const BLOCK_TYPE_MAP = {
  concept: 'card',    // синий блок «Важно»
  principle: 'text',
  tip: 'tip',         // жёлтый блок с лампочкой
  warning: 'tip',     // жёлтый, но с ⚠️ префиксом
  example: 'text',    // обычный текст с 📖 префиксом
};

function prefixForBlockType(type) {
  switch (type) {
    case 'warning': return '⚠️ ';
    case 'example': return '📖 ';
    default: return '';
  }
}

/**
 * Собирает LessonStep[] из theory_blocks + how_steps + common_mistakes + pro_tip.
 * Первый how_step получает вложенное видео.
 */
function stepsFromBlocks(blocks = [], how_steps = [], common_mistakes = [], pro_tip = null) {
  const steps = [];

  // Теоретические блоки
  for (const block of blocks) {
    const stepType = BLOCK_TYPE_MAP[block.type] || 'text';
    const prefix = prefixForBlockType(block.type);
    steps.push({ type: stepType, content: prefix + block.text });
  }

  // Практические шаги (с видео на первом)
  for (let i = 0; i < how_steps.length; i++) {
    const row = { type: 'card', content: `${i + 1}. ${how_steps[i]}` };
    if (i === 0) {
      row.media_type = 'video';
      row.media_url = LESSON_DEMO_VIDEO_URL;
      row.alt_text = 'Демонстрация первого шага';
    }
    steps.push(row);
  }

  // Типичные ошибки
  if (common_mistakes && common_mistakes.length > 0) {
    for (const mistake of common_mistakes) {
      steps.push({ type: 'tip', content: `⚠️ ${mistake}` });
    }
  }

  // Совет профессионала
  if (pro_tip) {
    steps.push({ type: 'tip', content: `💡 ${pro_tip}` });
  }

  return steps;
}

/** Строит markdown-теорию из полей нового формата. */
function buildTheoryMarkdown(al) {
  const parts = [];

  if (al.why) {
    parts.push(`## Зачем\n\n${al.why}`);
  }
  if (al.skip_cost) {
    parts.push(`\n> ⚠️ **Если пропустить:** ${al.skip_cost}`);
  }

  if (al.theory_blocks && al.theory_blocks.length > 0) {
    parts.push('\n### Теория\n');
    for (const block of al.theory_blocks) {
      const prefix = prefixForBlockType(block.type);
      parts.push(prefix + block.text);
    }
  }

  if (al.how_steps && al.how_steps.length > 0) {
    parts.push('\n### Как делать\n');
    al.how_steps.forEach((s, i) => parts.push(`${i + 1}. ${s}`));
  }

  if (al.common_mistakes && al.common_mistakes.length > 0) {
    parts.push('\n### Типичные ошибки\n');
    al.common_mistakes.forEach((m) => parts.push(`— ${m}`));
  }

  if (al.pro_tip) {
    parts.push(`\n> 💡 **Совет профессионала:** ${al.pro_tip}`);
  }

  return parts.join('\n');
}

/**
 * Преобразует новый формат fallback_tasks {easy, normal, hard}
 * в массив строк для buildFallbackTreePayload.
 */
function normalizeFallbackTasks(al) {
  const ft = al.fallback_tasks;
  if (Array.isArray(ft)) return ft; // старый формат — пропускаем

  if (ft && typeof ft === 'object') {
    return [
      ft.easy?.description || 'Убери отвлекающие факторы: тишина, один зритель, короткая сессия.',
      ft.normal?.description || 'Стандартное задание в привычном месте.',
    ];
  }
  return [];
}

/** Строит чекбоксы для DailyTask из success_criteria (или how_steps как fallback). */
function buildTaskCheckboxes(al) {
  const source = (al.success_criteria && al.success_criteria.length > 0)
    ? al.success_criteria
    : (al.how_steps || []).slice(0, 4);

  return source.map((label) => ({ type: 'checkbox', label }));
}

// ─── Поддержка и старого, и нового формата уроков ────────────────────────────

function isNewFormat(al) {
  return Array.isArray(al.theory_blocks);
}

function lessonFromAtomic(al) {
  if (isNewFormat(al)) {
    return lessonFromNewAtomic(al);
  }
  return lessonFromLegacyAtomic(al);
}

/** Новый формат (theory_blocks, success_criteria, …). */
function lessonFromNewAtomic(al) {
  const fallbackArr = normalizeFallbackTasks(al);
  const fakeFallbackAl = { fallback_tasks: fallbackArr, skill_key: al.skill_key };

  const meta = {
    why: al.why,
    skip_cost: al.skip_cost,
    reflection: true,
    fallback_tasks: al.fallback_tasks,
    skill_key: al.skill_key,
    difficulty: 1,
    progress_gain: 10,
    success_message: 'Отлично! 🎉',
    partial_message: 'Почти получилось 💪',
    fail_message: 'Попробуй проще — без отвлечений.',
    common_mistakes: al.common_mistakes,
    success_criteria: al.success_criteria,
    pro_tip: al.pro_tip,
  };
  if (al.video_url) meta.video_url = al.video_url;

  return {
    title: `День ${al.day}: ${al.title}`,
    description: al.why || al.title,
    theory: buildTheoryMarkdown(al),
    xp_reward: 20,
    order_index: al.day,
    meta: JSON.stringify(meta),
    fallback_tree: JSON.stringify(buildFallbackTreePayload(fakeFallbackAl)),
    steps: stepsFromBlocks(al.theory_blocks || [], al.how_steps || [], al.common_mistakes || [], al.pro_tip || null),
    daily_task: {
      title: al.title,
      description: al.why || al.title,
      duration_min: 10,
      steps: baseTaskSteps(buildTaskCheckboxes(al)),
    },
  };
}

/** Легаси формат (goal, task_checkboxes, xp, …). */
function lessonFromLegacyAtomic(al) {
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

  const taskCheckboxes = (al.task_checkboxes || []).map((t) => ({ type: 'checkbox', label: t }));

  return {
    title: `День ${al.day}: ${al.title}`,
    description: al.goal,
    theory: theoryParts.join('\n'),
    xp_reward: al.xp,
    order_index: al.day,
    meta: JSON.stringify(meta),
    fallback_tree: JSON.stringify(buildFallbackTreePayload(al)),
    steps: al.how_steps.map((t, i) => {
      const row = { type: 'card', content: t };
      if (i === 0) {
        row.media_type = 'video';
        row.media_url = LESSON_DEMO_VIDEO_URL;
        row.alt_text = `Демонстрация: ${al.title} — первый шаг`;
      }
      return row;
    }),
    daily_task: {
      title: al.title,
      description: al.goal,
      duration_min: al.time_minutes,
      steps: baseTaskSteps(taskCheckboxes),
    },
  };
}

// ─── Группировка по курсам ───────────────────────────────────────────────────

// Нормализуем: каждый урок должен иметь course_title для группировки.
// Новый формат использует course_id, поэтому маппим его в title.
const COURSE_ID_TO_TITLE = {};
for (const c of (atomic.courses || [])) {
  if (c.id && c.title) COURSE_ID_TO_TITLE[c.id] = c.title;
}

function getCourseTitle(al) {
  return al.course_title || COURSE_ID_TO_TITLE[al.course_id] || al.course_id || 'Курс';
}

const lessonsWithTitle = (atomic.lessons || []).map((al) => ({
  ...al,
  _courseTitle: getCourseTitle(al),
}));

const courseOrder = [...new Set(lessonsWithTitle.map((l) => l._courseTitle))];
const metaByTitle = Object.fromEntries((atomic.courses || []).map((c) => [c.title, c]));
const metaById   = Object.fromEntries((atomic.courses || []).map((c) => [c.id, c]));

const courses = courseOrder.map((title) => {
  const cm = metaByTitle[title] || metaById[Object.keys(COURSE_ID_TO_TITLE).find((k) => COURSE_ID_TO_TITLE[k] === title)] || null;
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
  const lessonsForCourse = lessonsWithTitle.filter((l) => l._courseTitle === title);
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
