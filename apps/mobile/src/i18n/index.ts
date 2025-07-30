import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LANG } from '@/const/locale';

import { loadAllResources, getSupportedLocales } from './generatedConfig';
import { getDetectedLocale } from './resource';

const LOCALE_STORAGE_KEY = 'lobe-chat-locale';

// 获取用户存储的语言设置
const getUserStoredLocale = async (): Promise<string> => {
  try {
    // 直接从 AsyncStorage 读取语言设置
    const stored = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);

    if (stored) {
      const localeMode = JSON.parse(stored) as string;

      // 如果用户设置了特定语言，使用用户设置
      if (localeMode && localeMode !== 'auto') {
        return localeMode;
      }
    }

    // 否则使用系统语言
    return getDetectedLocale();
  } catch (error) {
    console.error('Error getting user stored locale:', error);
    return getDetectedLocale();
  }
};

// 语言检测器
const languageDetector = {
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const userLocale = await getUserStoredLocale();
      callback(userLocale);
    } catch (error) {
      console.error('Error detecting language:', error);
      callback(DEFAULT_LANG);
    }
  },
  type: 'languageDetector' as const,
};

// 初始化 i18n
const initI18n = async () => {
  try {
    // 动态加载所有语言包
    const resources = await loadAllResources();

    await i18n
      .use(languageDetector)
      .use(initReactI18next)
      .init({
        debug: process.env.NODE_ENV === 'development',
        defaultNS: 'common',
        fallbackLng: DEFAULT_LANG,

        interpolation: {
          escapeValue: false, // React 已经处理了 XSS
        },

        ns: ['common', 'auth', 'chat', 'discover', 'error', 'setting'],

        react: {
          useSuspense: false, // React Native 不支持 Suspense
        },
        resources,
      });

    console.log('✅ i18n 初始化成功');
    console.log(`📊 支持的语言: ${getSupportedLocales().join(', ')}`);
  } catch (error) {
    console.error('❌ i18n 初始化失败:', error);
  }
};

// 立即初始化
initI18n();

export { default } from 'i18next';
