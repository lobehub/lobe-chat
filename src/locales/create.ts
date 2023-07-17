import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { commonLocaleSet } from './namespaces';

interface LocalSet {
  ['en-US']: Record<string, any>;
  ['zh-CN']: Record<string, any>;
}

interface I18NOptions {
  localSet: LocalSet;
  namespace: string;
}

export const createI18nNext = (options: I18NOptions) => {
  // 将语言包合并
  const resources = {
    'en-US': {
      common: commonLocaleSet['en-US'],
      [options.namespace]: options.localSet['en-US'],
    },
    'zh-CN': {
      common: commonLocaleSet['zh-CN'],
      [options.namespace]: options.localSet['zh-CN'],
    },
  };

  return (
    i18n
      // detect user language
      // learn more: https://github.com/i18next/i18next-browser-languageDetector
      .use(LanguageDetector)
      // pass the i18n instance to react-i18next.
      .use(initReactI18next)
      // init i18next
      // for all options read: https://www.i18next.com/overview/configuration-options
      .init({
        debug: process.env.NODE_ENV === 'development',
        defaultNS: [options.namespace, 'common'],
        fallbackLng: 'zh-CN',
        interpolation: {
          escapeValue: false, // not needed for react as it escapes by default
        },
        ns: [options.namespace, 'common'],
        resources,
      })
  );
};
