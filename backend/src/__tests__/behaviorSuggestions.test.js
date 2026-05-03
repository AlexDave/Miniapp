const { suggestionForType, skillTitle } = require('../utils/behaviorSuggestions');

describe('behaviorSuggestions', () => {
  test('каждый тип ведёт на skill_key', () => {
    const types = ['barking', 'accident', 'escape', 'aggression', 'chewing', 'other'];
    for (const t of types) {
      const s = suggestionForType(t);
      expect(s.skill_key).toMatch(/^[a-z0-9_.]+$/i);
      expect(skillTitle(s.skill_key)).toBeTruthy();
    }
  });
});
