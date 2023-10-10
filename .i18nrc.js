const { description } = require('./package.json');
const { defineConfig } = require('@lobehub/i18n-cli');

module.exports = defineConfig({
  reference: description,
  entry: 'locales/zh_CN',
  entryLocale: 'zh_CN',
  output: 'locales',
  outputLocales: ['zh_TW', 'en_US', 'ru_RU', 'ja_JP', 'ko_KR'],
  temperature: 0,
  modelName: 'gpt-3.5-turbo',
});
