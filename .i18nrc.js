const { description } = require('./package.json');

module.exports = {
  reference: description,
  entry: 'public/locales/zh_CN',
  entryLocale: 'zh_CN',
  output: 'public/locales',
  outputLocales: ['zh_HK', 'en_US', 'ja_JP', 'ko_KR'],
  splitToken: 2500,
  temperature: 0,
  modelName: 'gpt-3.5-turbo',
};
