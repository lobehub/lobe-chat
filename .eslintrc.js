const config = require('@lobehub/lint').eslint;

config.extends.push('plugin:@next/next/recommended');
//config.extends.push('plugin:@next/next/core-web-vitals');

module.exports = {
  ...config,
  rules: {
    ...config.rules,
    'react/jsx-sort-props': 'off',
    'sort-keys-fix/sort-keys-fix': 'off',
    'typescript-sort-keys/interface': 'off',
    'unicorn/switch-case-braces': 'off',
  },
};
