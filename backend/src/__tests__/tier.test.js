const { isUserProEffective, computeNewTierExpiresAt } = require('../utils/tier');

describe('tier utils', () => {
  test('free user not pro', () => {
    expect(isUserProEffective({ tier: 'free', tier_expires_at: null })).toBe(false);
  });

  test('pro without expiry is pro', () => {
    expect(isUserProEffective({ tier: 'pro', tier_expires_at: null })).toBe(true);
  });

  test('pro with future expiry', () => {
    const d = new Date(Date.now() + 86400000);
    expect(isUserProEffective({ tier: 'pro', tier_expires_at: d })).toBe(true);
  });

  test('pro with long-past expiry not pro (вне grace)', () => {
    const d = new Date(Date.now() - 14 * 86400000);
    expect(isUserProEffective({ tier: 'pro', tier_expires_at: d })).toBe(false);
  });

  test('computeNewTierExpiresAt extends from now when not pro', () => {
    const u = { tier: 'free', tier_expires_at: null };
    const now = new Date('2030-01-01T12:00:00Z');
    const exp = computeNewTierExpiresAt(u, now);
    expect(exp.getTime()).toBe(now.getTime() + 30 * 86400000);
  });
});
