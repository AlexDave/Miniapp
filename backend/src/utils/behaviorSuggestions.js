const { SKILLS } = require('../seed-skills');

let cached = null;

function loadSuggestions() {
  if (cached) return cached;
  cached = require('../../data/behavior-suggestions.json');
  return cached;
}

function suggestionForType(type) {
  const j = loadSuggestions();
  const row = j?.byType?.[type] || j?.byType?.other;
  return { skill_key: row.skill_key, label_ru: row.label_ru };
}

function skillTitle(skillKey) {
  const s = SKILLS.find((x) => x.key === skillKey);
  return s?.title ?? skillKey;
}

const TYPE_LABELS_RU = {
  barking: 'Лай',
  accident: 'Туалет',
  escape: 'Побег / срыв',
  aggression: 'Агрессия',
  chewing: 'Грызёт',
  other: 'Другое',
};

function typeLabelRu(type) {
  return TYPE_LABELS_RU[type] ?? type;
}

module.exports = {
  loadSuggestions,
  suggestionForType,
  skillTitle,
  typeLabelRu,
  TYPE_LABELS_RU,
};
