module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
    'plugin:jsx-control-statements/recommended',
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
    babelOptions: {
      configFile: './webpack/plugins.js',
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  root: true,
  plugins: ['react', 'jsx-control-statements'],
  rules: {
    'react/jsx-no-undef': [2, { allowGlobals: true }],
    'react/no-deprecated': 0,
  },
  overrides: [
    {
      files: ['*.js', '*.jsx'],
    },
  ],
}
