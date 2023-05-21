const config = require('@umijs/lint/dist/config/eslint');

module.exports = {
  ...config,
  extends: ['plugin:@next/next/recommended'],
};
