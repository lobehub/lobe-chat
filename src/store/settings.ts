import { ThemeMode } from 'antd-style';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { ConfigSettings } from '@/types/exportConfig';

export type SidebarTabKey = 'chat' | 'market';

interface SettingsStore {
  avatar?: string;
  importSettings: (settings: ConfigSettings) => void;
  inputHeight: number;
  sessionExpandable?: boolean;
  sessionsWidth: number;
  sidebarKey: SidebarTabKey;
  switchSideBar: (key: SidebarTabKey) => void;
  themeMode?: ThemeMode;
}

export const useSettings = create<SettingsStore>()(
  persist<SettingsStore>(
    (set) => ({
      importSettings: (settings) => {
        set({ ...settings });
      },
      inputHeight: 200,
      sessionExpandable: true,
      sessionsWidth: 320,
      sidebarKey: 'chat',
      switchSideBar: (key) => {
        set({ sidebarKey: key });
      },
    }),
    { name: 'LOBE_SETTINGS', skipHydration: true },
  ),
);
