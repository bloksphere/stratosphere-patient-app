module.exports = {
  root: true,
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  env: {
    node: true,
    es2022: true,
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
    },
    {
      files: ['apps/web/**/*.ts', 'apps/web/**/*.tsx'],
      extends: ['next/core-web-vitals'],
    },
    {
      files: ['apps/mobile/**/*.ts', 'apps/mobile/**/*.tsx'],
      extends: ['@react-native'],
    },
  ],
  ignorePatterns: ['node_modules/', 'dist/', '.next/', 'build/'],
};
