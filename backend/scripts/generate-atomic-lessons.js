/**
 * Одноразовая генерация backend/data/atomic-lessons.json из legacy gpt_coures.json.
 * Запуск: node backend/scripts/generate-atomic-lessons.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GPT_PATH = path.join(ROOT, 'data', 'gpt_coures.json');
const OUT_PATH = path.join(ROOT, 'data', 'atomic-lessons.json');

function inferSkillKey(day, courseId) {
  const t = `${day.title} ${day.goal}`.toLowerCase();
  if (t.includes('имя') || day.title.toLowerCase().includes('имя')) return 'intro.name';
  if (t.includes('туалет')) return 'daily.toilet';
  if (t.includes('укус') || t.includes('игру') || t.includes('без укусов')) return 'bound.bite';
  if (t.includes('спокой') || t.includes('отдых')) return 'daily.sleep';
  if (t.includes('одиночеств')) return 'self.alone';
  if (t.includes('поводок') || t.includes('прогулк') || t.includes('улице')) {
    if (t.includes('ко мне') || t.includes('подзыв')) return 'walk.recall';
    return 'walk.loose';
  }
  if (t.includes('социал')) return 'social.sounds';
  if (t.includes('контакт') || t.includes('взгляд') || t.includes('маркер')) return 'intro.eye';
  if (t.includes('ко мне') || t.includes('подход')) return 'walk.recall';
  if (t.includes('сидеть')) return 'control.sit';
  if (t.includes('лежать') || t.includes('укладк')) return 'control.down';
  if (t.includes('выдерж') || t.includes('ждать') || t.includes('ожидан')) return 'control.wait';
  if (t.includes('комбо') || t.includes('повтор') || t.includes('финал') || t.includes('тест')) {
    return courseId === 'puppy_adaptation' ? 'intro.eye' : 'control.sit';
  }
  return 'intro.eye';
}

function legacySkillFromKey(skillKey) {
  if (!skillKey || typeof skillKey !== 'string') return 'focus';
  if (skillKey.startsWith('walk.') || skillKey.startsWith('social.')) return 'recall';
  if (skillKey.startsWith('control.')) return 'sit';
  return 'focus';
}

function padHowSteps(tasks, min = 3) {
  const steps = [...tasks];
  while (steps.length < min) {
    steps.push('Повтори спокойно 3–5 раз');
  }
  return steps.slice(0, Math.max(min, Math.min(steps.length, 5)));
}

function buildAtomicDays(course) {
  return course.days.map((d) => {
    const tasks = Array.isArray(d.tasks) ? d.tasks : [];
    const how_steps = padHowSteps(tasks, 3).slice(0, 3);
    const checkboxes = tasks.length >= 3 ? tasks.slice(0, 5) : padHowSteps(tasks, 5).slice(0, 5);
    const skill_key = inferSkillKey(d, course.id);
    const why =
      d.why ??
      (skill_key.startsWith('walk.')
        ? 'Укрепляет безопасность и управляемость вне дома.'
        : skill_key.startsWith('control.')
          ? 'Базовые позиции для других упражнений.'
          : 'Формирует контакт и предсказуемость поведения.');

    return {
      course_id: course.id,
      course_title: course.title,
      day: d.day,
      title: d.title,
      goal: d.goal,
      why,
      how_steps,
      task_checkboxes: checkboxes,
      fallback_tasks: Array.isArray(d.fallback_tasks)
        ? d.fallback_tasks
        : ['Сделай упражнение в тихой комнате', 'Сократи сессию до 2–3 минут'],
      skill_key,
      legacy_skill: legacySkillFromKey(skill_key),
      video_url: d.video_url ?? null,
      time_minutes: d.time_minutes ?? 5,
      xp: d.xp ?? 10,
      badge: d.badge ?? null,
      combo: d.combo ?? false,
      source_day_id: d.id ?? `day_${course.id}_${d.day}`,
    };
  });
}

function main() {
  const raw = fs.readFileSync(GPT_PATH, 'utf8');
  const gpt = JSON.parse(raw);
  const lessons = [];
  for (const c of gpt.courses) {
    lessons.push(...buildAtomicDays(c));
  }

  const courseMeta = gpt.courses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    duration_days: c.duration_days,
    difficulty: c.difficulty,
  }));

  const doc = {
    version: 1,
    generatedAt: new Date().toISOString(),
    source: 'migrated_from_gpt_coures.json',
    defaults: gpt.defaults ?? {},
    courses: courseMeta,
    lessons,
  };

  fs.writeFileSync(OUT_PATH, `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${lessons.length} lessons to ${OUT_PATH}`);
}

main();
