import { ThemeMode } from 'antd-style';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { ConfigSettings } from '@/types/exportConfig';

export type SidebarTabKey = 'chat' | 'market';

interface SettingsStore {
  sessionsWidth: number;
  inputHeight: number;
  avatar?: string;
  sessionExpandable?: boolean;
  sidebarKey: SidebarTabKey;
  themeMode?: ThemeMode;
  importSettings: (settings: ConfigSettings) => void;
  switchSideBar: (key: SidebarTabKey) => void;
}

export const useSettings = create<SettingsStore>()(
  persist<SettingsStore>(
    (set) => ({
      sessionsWidth: 320,
      inputHeight: 200,
      sessionExpandable: true,
      sidebarKey: 'chat',
      importSettings: (settings) => {
        set({ ...settings });
      },
      switchSideBar: (key) => {
        set({ sidebarKey: key });
      },
    }),
    { name: 'LOBE_SETTINGS', skipHydration: true },
  ),
);
