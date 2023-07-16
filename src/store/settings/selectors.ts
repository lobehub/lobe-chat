import { DEFAULT_SETTINGS } from '@/store/settings/initialState';

import { SettingsStore } from './store';

const currentSettings = (s: SettingsStore) => s.settings || DEFAULT_SETTINGS;

export const settingsSelectors = {
  currentSettings,
};
