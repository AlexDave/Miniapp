const { mergeNoAttempt, parseAttemptsAtLevel, buildFallbackTreePayload } = require('../utils/fallbackTree');

describe('fallbackTree', () => {
  test('mergeNoAttempt увеличивает счётчики по уровню', () => {
    const a = mergeNoAttempt(null, 1);
    expect(a.by_tier['1']).toBe(1);
    expect(a.no_total).toBe(1);
    const b = mergeNoAttempt(JSON.stringify(a), 3);
    expect(b.by_tier['1']).toBe(1);
    expect(b.by_tier['3']).toBe(1);
    expect(b.no_total).toBe(2);
  });

  test('parseAttemptsAtLevel даёт пустой объект по умолчанию', () => {
    expect(parseAttemptsAtLevel(null).by_tier).toEqual({});
    expect(parseAttemptsAtLevel(null).no_total).toBe(0);
  });

  test('buildFallbackTreePayload содержит L1–L3 и faq', () => {
    const tree = buildFallbackTreePayload({
      fallback_tasks: ['A', 'B'],
      skill_key: 'walk.recall',
    });
    expect(tree.L1.summary).toBe('A');
    expect(tree.L2.summary).toBe('B');
    expect(tree.L3.hints.length).toBeGreaterThan(0);
    expect(Array.isArray(tree.faq)).toBe(true);
    expect(tree.faq.length).toBeGreaterThan(0);
  });
});
