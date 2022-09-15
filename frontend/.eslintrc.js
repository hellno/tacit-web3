module.exports = {
  env: {
    browser: false,
    es2021: true,
    mocha: true,
    node: true
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'standard',
    'plugin:node/recommended',
    'plugin:@next/next/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    'node/no-unsupported-features/es-syntax': [
      'error',
      { ignores: ['modules'] }
    ],
    'node/no-missing-import': 'off',
    '@next/next/no-img-element': 'off'
  },
  overrides: [{
    files: ['pages/*.tsx'],
    rules: {
      'node/no-unpublished-import': 'off',
      'node/no-extraneous-import': 'off',
      'no-unused-vars': 'off',
      'spaced-comment': 'off',
      'multiline-ternary': 'off'
    }
  }
  ]
}
