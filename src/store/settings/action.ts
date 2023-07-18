import { ThemeMode } from 'antd-style';
import { merge } from 'lodash-es';
import type { StateCreator } from 'zustand/vanilla';

import type { ConfigSettings } from '@/types/exportConfig';

import type { SidebarTabKey } from './initialState';
import { GlobalSettingsState } from './initialState';
import type { SettingsStore } from './store';

export interface SettingsAction {
  setGlobalSettings: (settings: GlobalSettingsState) => void;
  setSettings: (settings: { [keys in keyof ConfigSettings]?: any }) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  switchSideBar: (key: SidebarTabKey) => void;
}

export const createSettings: StateCreator<
  SettingsStore,
  [['zustand/devtools', never]],
  [],
  SettingsAction
> = (set, get) => ({
  setGlobalSettings: (settings) => {
    set({ ...settings });
  },
  setSettings: (settings) => {
    set({ settings: merge(get().settings, settings) });
  },
  setThemeMode: (themeMode) => {
    get().setSettings({ themeMode });
  },
  switchSideBar: (key) => {
    set({ sidebarKey: key });
  },
});
