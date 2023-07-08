const config = require('@lobehub/lint').eslint;

config.extends.push('plugin:@next/next/recommended');
//config.extends.push('plugin:@next/next/core-web-vitals');

module.exports = {
  ...config,
  rules: {
    'typescript-sort-keys/interface': 'off',
    'unicorn/filename-case': 'off',
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/switch-case-braces': 'off',
    'unicorn/prefer-module': 'off',
  },
};
