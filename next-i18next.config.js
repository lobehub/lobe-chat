const i18n = require('./.i18nrc');

/** @type {import('next-i18next').UserConfig} */
module.exports = {
  debug: false,
  fallbackLng: {
    default: ['zh_CN'],
  },
  i18n: {
    defaultLocale: i18n.entryLocale,
    locales: [i18n.entryLocale, ...i18n.outputLocales],
  },
  localePath:
    typeof window === 'undefined' ? require('node:path').resolve('./public/locales') : '/locales',
};
