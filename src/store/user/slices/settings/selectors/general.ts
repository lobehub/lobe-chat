import { DEFAULT_LANG } from '@/const/locale';
import { Locales } from '@/locales/resources';
import { isOnServerSide } from '@/utils/env';

import { UserStore } from '../../../store';
import { currentSettings } from './settings';

const generalConfig = (s: UserStore) => currentSettings(s).general || {};

const currentLanguage = (s: UserStore) => {
  const locale = generalConfig(s).language;

  if (locale === 'auto') {
    if (isOnServerSide) return DEFAULT_LANG;

    return navigator.language as Locales;
  }

  return locale;
};

const currentThemeMode = (s: UserStore) => {
  const themeMode = generalConfig(s).themeMode;
  return themeMode || 'auto';
};

const neutralColor = (s: UserStore) => generalConfig(s).neutralColor;
const primaryColor = (s: UserStore) => generalConfig(s).primaryColor;
const fontSize = (s: UserStore) => generalConfig(s).fontSize;
const language = (s: UserStore) => generalConfig(s).language;

export const userGeneralSettingsSelectors = {
  config: generalConfig,
  currentLanguage,
  currentThemeMode,
  fontSize,
  language,
  neutralColor,
  primaryColor,
};
