/**
 * Соответствует ли урок атому (meta.skill_key, meta.skill и legacy focus/sit/recall).
 * @param {string|object|null|undefined} metaRaw
 * @param {string} skillKey
 */
function lessonMatchesSkill(metaRaw, skillKey) {
  try {
    const meta = metaRaw ? (typeof metaRaw === 'string' ? JSON.parse(metaRaw) : metaRaw) : {};
    if (meta.skill_key && meta.skill_key === skillKey) return true;
    const sk = meta.skill ?? 'focus';
    const keyMap = { focus: 'intro.eye', sit: 'control.sit', recall: 'walk.recall' };
    const mappedKey = keyMap[sk] ?? sk;
    return mappedKey === skillKey || sk === skillKey;
  } catch {
    return false;
  }
}

module.exports = { lessonMatchesSkill };
