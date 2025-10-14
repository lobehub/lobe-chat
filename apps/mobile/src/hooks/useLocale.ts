import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ensureLanguageResources } from '@/i18n';
import { LANGUAGE_OPTIONS, LocaleMode, getDetectedLocale } from '@/i18n/resource';
import { appStorage } from '@/utils/storage';

const LOCALE_STORAGE_KEY = 'lobe-chat-locale';

export const useLocale = () => {
  const { t, i18n } = useTranslation('setting');
  const [localeMode, setLocaleModeState] = useState<LocaleMode>('auto');

  /**
   * 从 MMKV 加载语言设置（同步）
   */
  const loadLocaleMode = useCallback(() => {
    try {
      const stored = appStorage.getString(LOCALE_STORAGE_KEY);
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

  /**
   * 保存语言设置到 MMKV（同步）
   */
  const saveLocaleMode = useCallback((mode: LocaleMode) => {
    try {
      appStorage.set(LOCALE_STORAGE_KEY, JSON.stringify(mode));
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
        // 保存用户选择
        saveLocaleMode(locale);

        // 确定要使用的语言
        const targetLocale = locale === 'auto' ? getDetectedLocale() : locale;

        // 加载语言资源
        await ensureLanguageResources(targetLocale);

        // 切换语言
        await i18n.changeLanguage(targetLocale);
      } catch (error) {
        console.error('Error changing locale:', error);
      }
    },
    [i18n, saveLocaleMode],
  );

  const getLocaleDisplayName = useCallback(() => {
    const currentLocale = i18n.language || localeMode;

    if (currentLocale === 'auto' || localeMode === 'auto') {
      return t('locale.auto.title', { ns: 'setting' });
    }

    const option = LANGUAGE_OPTIONS.find((option) => option.value === currentLocale);
    return option?.label || currentLocale;
  }, [i18n.language, localeMode, t]);

  return {
    changeLocale,
    getLocaleDisplayName,
    localeMode,
  };
};
