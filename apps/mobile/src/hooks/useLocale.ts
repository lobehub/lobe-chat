import AsyncStorage from '@react-native-async-storage/async-storage';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LANGUAGE_OPTIONS, LocaleMode, getDetectedLocale } from '@/i18n/resource';

const LOCALE_STORAGE_KEY = 'lobe-chat-locale';

export const useLocale = () => {
  const { t, i18n } = useTranslation('setting');
  const [localeMode, setLocaleModeState] = useState<LocaleMode>('auto');

  // 从 AsyncStorage 加载语言设置
  const loadLocaleMode = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored) {
        const mode = JSON.parse(stored) as LocaleMode;
        setLocaleModeState(mode);
        return mode;
      }
    } catch (error) {
      console.error('Error loading locale mode:', error);
    }
    return 'auto';
  }, []);

  // 保存语言设置到 AsyncStorage
  const saveLocaleMode = useCallback(async (mode: LocaleMode) => {
    try {
      await AsyncStorage.setItem(LOCALE_STORAGE_KEY, JSON.stringify(mode));
      setLocaleModeState(mode);
    } catch (error) {
      console.error('Error saving locale mode:', error);
    }
  }, []);

  // 组件挂载时加载语言设置
  useEffect(() => {
    loadLocaleMode();
  }, [loadLocaleMode]);

  const changeLocale = useCallback(
    async (locale: LocaleMode) => {
      try {
        if (locale === 'auto') {
          // 跟随系统设置
          const detectedLanguage = getDetectedLocale();
          await i18n.changeLanguage(detectedLanguage);
          await saveLocaleMode('auto');
        } else {
          // 使用指定语言
          await i18n.changeLanguage(locale);
          await saveLocaleMode(locale);
        }
      } catch (error) {
        console.error('Error changing language:', error);
      }
    },
    [i18n, saveLocaleMode],
  );

  const getLocaleDisplayName = useCallback(() => {
    // 直接从 AsyncStorage 读取最新的 localeMode
    const currentLocale = i18n.language || localeMode;

    if (currentLocale === 'auto' || localeMode === 'auto') {
      return t('locale.auto.title', { ns: 'setting' });
    }

    const option = LANGUAGE_OPTIONS.find((option) => option.value === currentLocale);
    return option?.label || currentLocale;
  }, [i18n.language, localeMode]);

  return {
    changeLocale,
    getLocaleDisplayName,
    localeMode,
  };
};
