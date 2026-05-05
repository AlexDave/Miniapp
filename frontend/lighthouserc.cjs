/**
 * Lighthouse CI: мобильный прогон по собранному dist.
 * Пороги — статические; сравнение «регрессия > 5 пунктов» к базовому прогону
 * потребует отдельного хранилища артефактов LHCI (см. документацию LHCI).
 */
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: ['/'],
      numberOfRuns: 1,
      settings: {
        formFactor: 'mobile',
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
        },
        screenEmulation: {
          mobile: true,
          width: 390,
          height: 844,
          deviceScaleFactor: 2,
          disabled: false,
        },
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.65 }],
        'categories:accessibility': ['error', { minScore: 0.88 }],
        'categories:best-practices': ['error', { minScore: 0.88 }],
      },
    },
  },
};
