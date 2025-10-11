import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LANG } from '@/_const/locale';
import { isDev } from '@/utils/env';

import {
  getSupportedLocales,
  loadLocaleResources as loadGeneratedLocaleResources,
} from './generatedConfig';
import { getDetectedLocale } from './resource';

const LOCALE_STORAGE_KEY = 'lobe-chat-locale';
const DEV_LOCALE = 'zh-CN';

// 获取用户存储的语言设置
export const getUserStoredLocale = async (): Promise<string> => {
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

const loadLocaleResources = async (lng: string) => {
  if (isDev && lng === DEV_LOCALE) {
    const { default: defaultResources } = await import('./default');

    return defaultResources as Record<string, any>;
  }

  return loadGeneratedLocaleResources(lng);
};

// 初始化 i18n
const initI18n = async () => {
  try {
    // 仅加载当前语言（并带上默认语言作为兜底）
    const current = await getUserStoredLocale();
    const currentResources = await loadLocaleResources(current);
    const resources = {
      [current]: currentResources,
      ...(current !== DEFAULT_LANG
        ? { [DEFAULT_LANG]: await loadLocaleResources(DEFAULT_LANG) }
        : {}),
    } as Record<string, Record<string, any>>;

    await i18n
      .use(languageDetector)
      .use(initReactI18next)
      .init({
        debug: isDev,
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

export const ensureLanguageResources = async (lng: string) => {
  try {
    const namespaces = ['common', 'auth', 'chat', 'discover', 'error', 'setting'];

    // 如果任一命名空间未加载，则加载整包
    const needsLoad = namespaces.some((ns) => !i18n.hasResourceBundle(lng, ns));
    if (!needsLoad) return;

    const bundles = await loadLocaleResources(lng);
    for (const [ns, res] of Object.entries(bundles)) {
      // deep merge + overwrite，确保更新生效
      i18n.addResourceBundle(lng, ns, res as any, true, true);
    }
  } catch (error) {
    console.error('Failed to ensure language resources:', error);
  }
};

export { default } from 'i18next';
