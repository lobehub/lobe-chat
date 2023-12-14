const { defineConfig } = require('@lobehub/i18n-cli');

module.exports = defineConfig({
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
    entry: ['./README.zh-CN.md', './docs/**/*.zh-CN.md'],
    entryLocale: 'zh-CN',
    entryExtension: '.zh-CN.md',
    outputLocales: ['en-US'],
    outputExtensions: (locale, { getDefaultExtension }) => {
      if (locale === 'en-US') return '.md';
      return getDefaultExtension(locale);
    },
  },
});
