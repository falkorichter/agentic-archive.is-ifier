const js = require('@eslint/js');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        chrome: 'readonly',
        browser: 'readonly',
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        XMLHttpRequest: 'readonly',
        fetch: 'readonly',
        Promise: 'readonly',
        URL: 'readonly',
        navigator: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'eqeqeq': 'error',
      'no-var': 'error',
      'prefer-const': 'warn',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'no-useless-escape': 'warn',
      'no-undef': 'error'
    }
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        require: 'readonly',
        global: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        exports: 'readonly'
      }
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off', // Test functions are used by other test files via script imports
      'no-undef': 'off' // Test files use functions from other test files via script imports
    }
  },
  prettierConfig,
  {
    ignores: ['node_modules/**', 'eslint.config.js']
  }
];