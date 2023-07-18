import { merge } from 'lodash-es';

import { DEFAULT_SETTINGS } from '@/store/settings/initialState';

import { SettingsStore } from './store';

const currentSettings = (s: SettingsStore) => merge(DEFAULT_SETTINGS, s.settings);

const selecThemeMode = (s: SettingsStore) => ({
  setThemeMode: s.setThemeMode,
  themeMode: s.settings.themeMode,
});

export const settingsSelectors = {
  currentSettings,
  selecThemeMode,
};
