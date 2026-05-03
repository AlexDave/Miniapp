// Flat-config ESLint для monorepo. Frontend (React 18, ESM) + backend (Node, CommonJS).
// Использует уже установленный в frontend `eslint` ^9 и плагины react / react-hooks.
const js = require('@eslint/js');
const globals = require('globals');
const reactHooks = require('eslint-plugin-react-hooks');
const reactRefresh = require('eslint-plugin-react-refresh');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      '**/node_modules/**',
      'frontend/dist/**',
      'frontend/build/**',
      'backend/prisma/migrations/**',
      'backend/prisma/dev.db*',
      'coverage/**',
      '.lhci/**',
      'курс/**',
      '**/*.min.js',
    ],
  },

  js.configs.recommended,

  // Backend: Node.js + CommonJS
  {
    files: ['backend/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node, ...globals.jest },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },

  // Frontend: React 18 + ESM + browser
  {
    files: ['frontend/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.es2021 },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^[A-Z_]' }],
      'no-undef': 'off', // JSX components могут быть импортированы лениво
    },
  },

  // Тесты — Vitest и Jest globals
  {
    files: ['**/__tests__/**/*.{js,jsx}', '**/*.test.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.jest, ...globals.node, ...globals.browser },
    },
    rules: {
      'no-unused-vars': 'off',
    },
  },
];
