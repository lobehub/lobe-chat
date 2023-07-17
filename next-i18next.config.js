const i18n = require('./.i18nrc');

/** @type {import('next-i18next').UserConfig} */
module.exports = {
  debug: process.env.NODE_ENV === 'development',
  fallbackLng: {
    default: ['zh_CN'],
    zh_TW: ['zh_CN'],
  },
  i18n: {
    defaultLocale: i18n.entryLocale,
    locales: [i18n.entryLocale, ...i18n.outputLocales],
  },
  localePath:
    typeof window === 'undefined' ? require('node:path').resolve('./', i18n.output) : '/locales',
  react: { useSuspense: false },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  strictMode: true,
};
