const config = require('@lobehub/lint').eslint;

config.extends.push('plugin:@next/next/recommended');
//config.extends.push('plugin:@next/next/core-web-vitals');

config.rules['unicorn/no-negated-condition'] = 0;
module.exports = config;
