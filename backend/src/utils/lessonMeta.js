const DEFAULT_SKILLS = { focus: 0, recall: 0, sit: 0 };

function parseLessonMeta(metaStr) {
  if (!metaStr) return null;
  try {
    return JSON.parse(metaStr);
  } catch {
    return null;
  }
}

function normalizeSkills(json) {
  if (!json) return { ...DEFAULT_SKILLS };
  try {
    const o = typeof json === 'string' ? JSON.parse(json) : json;
    return { ...DEFAULT_SKILLS, ...o };
  } catch {
    return { ...DEFAULT_SKILLS };
  }
}

function applySkillDelta(skillsJson, skillKey, success, progressGain) {
  const raw = normalizeSkills(skillsJson);
  const gain = Number(progressGain) || 10;
  let add = 0;
  if (success === 'yes') add = gain;
  else if (success === 'partial') add = Math.max(1, Math.floor(gain / 2));
  const cur = raw[skillKey] ?? 0;
  raw[skillKey] = Math.min(100, cur + add);
  return JSON.stringify(raw);
}

module.exports = { parseLessonMeta, normalizeSkills, DEFAULT_SKILLS, applySkillDelta };
