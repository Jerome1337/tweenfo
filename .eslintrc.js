module.exports = {
  parser: '@babel/eslint-parser',
  env: {
    es6: true,
    browser: true,
  },
  plugins: ['svelte3'],
  overrides: [
    {
      files: ['*.svelte'],
      processor: 'svelte3/svelte3',
    },
  ],
  extends: ['airbnb', 'prettier'],
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
      },
    ],
    'import/first': 'off',
    'import/export': 'off',
    'import/no-mutable-exports': 'off',
    'import/prefer-default-export': 'off',
  },
};
