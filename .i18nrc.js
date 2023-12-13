const { description } = require('./package.json');
const { defineConfig } = require('@lobehub/i18n-cli');

module.exports = defineConfig({
  reference: description,
  entry: 'locales/zh_CN',
  entryLocale: 'zh_CN',
  output: 'locales',
  outputLocales: ['zh_TW', 'en_US', 'ru_RU', 'ja_JP', 'ko_KR', 'fr_FR'],
  temperature: 0,
  modelName: 'gpt-3.5-turbo-1106',
  splitToken: 1024,
  experimental: {
    jsonMode: true,
  },
  markdown: {
    entry: ['./README.md'],
    outputLocales: ['zh_CN'],
    outputExtensions: (locale) => {
      if (locale === 'en_US') return '.md';
      return `.${locale.replace('_', '-')}.md`;
    },
  },
});
