import { defaults } from 'lodash-es';

import { DEFAULT_SETTINGS } from '@/store/settings/initialState';

import { SettingsStore } from './store';

const currentSettings = (s: SettingsStore) => defaults(s.settings, DEFAULT_SETTINGS);

const selecThemeMode = (s: SettingsStore) => ({
  setThemeMode: s.setThemeMode,
  themeMode: s.settings.themeMode,
});

export const settingsSelectors = {
  currentSettings,
  selecThemeMode,
};
