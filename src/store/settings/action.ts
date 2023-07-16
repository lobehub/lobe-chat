import { merge } from 'lodash-es';
import type { StateCreator } from 'zustand/vanilla';

import type { ConfigSettings } from '@/types/exportConfig';

import type { SidebarTabKey } from './initialState';
import { SettingsState } from './initialState';
import type { SettingsStore } from './store';

export interface SettingsAction {
  importSettings: (settings: SettingsState) => void;
  saveSettings: (settings: ConfigSettings) => void;
  switchSideBar: (key: SidebarTabKey) => void;
}

export const createSettings: StateCreator<
  SettingsStore,
  [['zustand/devtools', never]],
  [],
  SettingsAction
> = (set, get) => ({
  importSettings: (settings) => {
    set({ ...settings });
  },
  saveSettings: (settings) => {
    set({ settings: merge(get().settings, settings) });
  },
  switchSideBar: (key) => {
    set({ sidebarKey: key });
  },
});
