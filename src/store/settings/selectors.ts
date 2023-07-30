import { defaults } from 'lodash-es';

import { DEFAULT_SETTINGS } from '@/store/settings/initialState';
import { GlobalSettings } from '@/types/settings';

import { SettingsStore } from './store';

const currentSettings = (s: SettingsStore) => defaults(s.settings, DEFAULT_SETTINGS);

const selecThemeMode = (s: SettingsStore) => ({
  setThemeMode: s.setThemeMode,
  themeMode: s.settings.themeMode,
});

export const exportSettings = (s: SettingsStore) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { OPENAI_API_KEY: _, password: __, ...settings } = s.settings;

  return settings as GlobalSettings;
};

export const settingsSelectors = {
  currentSettings,
  exportSettings,

  selecThemeMode,
};
