module.exports = {
  root: true,
  extends: [
    'expo',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react-hooks/exhaustive-deps': 'warn',
    // eslint-plugin-import conflicts with the installed TypeScript resolver version;
    // TypeScript itself (tsc --noEmit) already enforces import correctness.
    'import/namespace': 'off',
    'import/no-unresolved': 'off',
  },
  ignorePatterns: ['node_modules/', 'dist/', '.expo/'],
};
