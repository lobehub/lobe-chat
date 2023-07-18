import { ThemeMode } from 'antd-style';
import type { StateCreator } from 'zustand/vanilla';

import type { ConfigSettings } from '@/types/exportConfig';

import type { SidebarTabKey } from './initialState';
import { DEFAULT_SETTINGS, GlobalSettingsState } from './initialState';
import type { SettingsStore } from './store';

export interface SettingsAction {
  resetSettings: () => void;
  setGlobalSettings: (settings: GlobalSettingsState) => void;
  setSettings: (settings: Partial<ConfigSettings>) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  switchSideBar: (key: SidebarTabKey) => void;
}

export const createSettings: StateCreator<
  SettingsStore,
  [['zustand/devtools', never]],
  [],
  SettingsAction
> = (set, get) => ({
  resetSettings: () => {
    set({ settings: DEFAULT_SETTINGS });
  },
  setGlobalSettings: (settings) => {
    set({ ...settings });
  },
  setSettings: (settings) => {
    const oldSetting = get().settings;
    set({ settings: { ...oldSetting, ...settings } });
  },
  setThemeMode: (themeMode) => {
    get().setSettings({ themeMode });
  },
  switchSideBar: (key) => {
    set({ sidebarKey: key });
  },
});
