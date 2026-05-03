const { SKILLS } = require('../seed-skills');

const skillTitle = (key) => {
  const s = SKILLS.find((x) => x.key === key);
  return s?.title ?? key;
};

/** Смежные атомы для FAQ (туалет / лай / возбуждение и др.) */
const RELATED_BY_PREFIX = {
  intro: ['daily.sleep', 'control.sit', 'walk.recall'],
  daily: ['intro.name', 'intro.eye', 'social.sounds'],
  social: ['intro.eye', 'walk.recall', 'daily.sleep'],
  control: ['intro.eye', 'walk.loose', 'daily.sleep'],
  walk: ['daily.toilet', 'bound.bark', 'self.tired'],
  boundaries: ['self.tired', 'daily.sleep', 'social.sounds'],
  self: ['daily.sleep', 'bound.bark', 'control.place'],
};

function categoryFromSkillKey(skillKey) {
  if (!skillKey || typeof skillKey !== 'string') return 'intro';
  const prefix = skillKey.split('.')[0];
  if (RELATED_BY_PREFIX[prefix]) return prefix;
  const sk = SKILLS.find((s) => s.key === skillKey);
  const cat = sk?.category_key;
  if (cat && RELATED_BY_PREFIX[cat]) return cat;
  return 'intro';
}

function buildFaqLinks(skillKey) {
  const cat = categoryFromSkillKey(skillKey);
  const keys = (RELATED_BY_PREFIX[cat] || RELATED_BY_PREFIX.intro).filter((k) => k !== skillKey);
  return keys.slice(0, 5).map((k) => ({ skill_key: k, title: skillTitle(k) }));
}

/**
 * @param {object} al — запись из atomic-lessons.json
 * @returns {object} дерево L1–L3 + faq
 */
function buildFallbackTreePayload(al) {
  const t = Array.isArray(al.fallback_tasks) ? al.fallback_tasks : [];
  const s1 = t[0] || 'Убери отвлекающие факторы: тишина, один зритель, короткая сессия.';
  const s2 = t[1] || 'Сократи до 1–2 минут: один повтор, награда и выход.';
  const skillKey = al.skill_key || 'intro.eye';
  const faq = Array.isArray(al.faq_links) && al.faq_links.length > 0 ? al.faq_links : buildFaqLinks(skillKey);

  return {
    L1: {
      title: 'Сначала упрости условия',
      summary: s1,
      hints: [s1, 'Снизь критерий: достаточно одного удачного повтора.'],
    },
    L2: {
      title: 'Ещё проще',
      summary: s2,
      hints: [s2, 'Можно тренировать «на месте» без движения по комнате.'],
    },
    L3: {
      title: 'Минимальный шаг',
      summary: 'Один повтор без идеала: сигнал → крошечное движение → награда → конец.',
      hints: ['Без продолжения серии — только закрепить контакт с наградой.', 'Если собака в стрессе — сделай перерыв на несколько часов.'],
    },
    faq,
  };
}

function parseJsonSafe(str, fallback = null) {
  if (!str || typeof str !== 'string') return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function minimalTreeFromMeta(fallbackTasks, skillKey) {
  const fake = { fallback_tasks: fallbackTasks || [], skill_key: skillKey };
  return buildFallbackTreePayload(fake);
}

/**
 * Дополняет DTO урока полем fallback_tree (если в БД пусто — из meta.fallback_tasks).
 * @param {object} dto — lessonDto (meta уже объект или null)
 */
function ensureFallbackTreeOnLesson(dto) {
  if (!dto) return dto;
  if (dto.fallback_tree && typeof dto.fallback_tree === 'object') return dto;
  const meta = dto.meta && typeof dto.meta === 'object' ? dto.meta : {};
  dto.fallback_tree = minimalTreeFromMeta(meta.fallback_tasks, meta.skill_key || meta.skill);
  return dto;
}

function parseAttemptsAtLevel(raw) {
  const o = typeof raw === 'string' ? parseJsonSafe(raw, {}) : raw && typeof raw === 'object' ? raw : {};
  return {
    by_tier: typeof o.by_tier === 'object' && o.by_tier ? { ...o.by_tier } : {},
    no_total: typeof o.no_total === 'number' ? o.no_total : 0,
  };
}

function mergeNoAttempt(prevRaw, tier) {
  const cur = parseAttemptsAtLevel(prevRaw);
  const t = Math.min(3, Math.max(1, Number(tier) || 1));
  const k = String(t);
  cur.by_tier[k] = (cur.by_tier[k] || 0) + 1;
  cur.no_total = (cur.no_total || 0) + 1;
  return cur;
}

module.exports = {
  buildFallbackTreePayload,
  ensureFallbackTreeOnLesson,
  parseAttemptsAtLevel,
  mergeNoAttempt,
  minimalTreeFromMeta,
};
