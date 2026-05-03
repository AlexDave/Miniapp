/**
 * Контракт JSON в Profile.preferences (строка).
 * Служебные ключи стрика и заморозки не удалять при merge из клиента.
 */

const CLIENT_WRITABLE_KEYS = new Set([
  'onboarding_completed',
  'dog_age_bucket',
  'learning_goals',
  'primary_problem',
  'coach_dashboard_tip_seen',
  'coach_train_tip_seen',
  'coach_lesson_tip_seen',
]);

/** @typedef {'under6mo' | '6mo_2y' | 'older'} DogAgeBucket */

function parsePreferences(raw) {
  if (!raw || typeof raw !== 'string') return {};
  try {
    const o = JSON.parse(raw);
    return o && typeof o === 'object' && !Array.isArray(o) ? o : {};
  } catch {
    return {};
  }
}

/**
 * Deep-merge только разрешённых ключей из patch в существующие preferences (без потери last_freeze_at и др.).
 */
function mergePreferences(existingRaw, patch) {
  const base = parsePreferences(existingRaw);
  if (!patch || typeof patch !== 'object') return base;

  const next = { ...base };
  for (const key of CLIENT_WRITABLE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(patch, key)) {
      const v = patch[key];
      if (key === 'learning_goals') {
        next[key] = Array.isArray(v) ? v.map(String) : [];
      } else if (
        key === 'onboarding_completed' ||
        key === 'coach_dashboard_tip_seen' ||
        key === 'coach_train_tip_seen' ||
        key === 'coach_lesson_tip_seen'
      ) {
        next[key] = Boolean(v);
      } else if (key === 'dog_age_bucket') {
        if (['under6mo', '6mo_2y', 'older'].includes(v)) next[key] = v;
      } else if (key === 'primary_problem') {
        next[key] = v == null || v === '' ? null : String(v).slice(0, 500);
      }
    }
  }
  return next;
}

function preferencesToPublic(prefs) {
  return {
    onboardingCompleted: prefs.onboarding_completed === true,
    dogAgeBucket: prefs.dog_age_bucket ?? null,
    learningGoals: Array.isArray(prefs.learning_goals) ? prefs.learning_goals : [],
    primaryProblem: prefs.primary_problem ?? null,
    coachTips: {
      dashboard: prefs.coach_dashboard_tip_seen === true,
      train: prefs.coach_train_tip_seen === true,
      lesson: prefs.coach_lesson_tip_seen === true,
    },
  };
}

module.exports = {
  parsePreferences,
  mergePreferences,
  preferencesToPublic,
  CLIENT_WRITABLE_KEYS,
};
