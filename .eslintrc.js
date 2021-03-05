const { OFF, ERROR } = {
  OFF: 'off',
  ERROR: 'error',
};

module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'arrow-parens': [ERROR, 'as-needed'],
    'no-console': OFF,
    'no-param-reassign': OFF,
    'no-plusplus': OFF,
    'no-return-assign': OFF,
    'object-curly-newline': [ERROR, { consistent: true }],
  },
};
