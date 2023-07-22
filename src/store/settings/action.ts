import { ThemeMode } from 'antd-style';
import type { StateCreator } from 'zustand/vanilla';

import type { ConfigSettings } from '@/types/exportConfig';

import type { SidebarTabKey } from './initialState';
import { DEFAULT_SETTINGS, GlobalSettingsState } from './initialState';
import type { SettingsStore } from './store';

/**
 * 设置操作
 */
export interface SettingsAction {
  /**
   * 重置设置
   */
  resetSettings: () => void;
  /**
   * 设置全局设置
   * @param settings - 全局设置
   */
  setGlobalSettings: (settings: GlobalSettingsState) => void;
  /**
   * 设置部分配置设置
   * @param settings - 部分配置设置
   */
  setSettings: (settings: Partial<ConfigSettings>) => void;
  /**
   * 设置主题模式
   * @param themeMode - 主题模式
   */
  setThemeMode: (themeMode: ThemeMode) => void;
  /**
   * 切换侧边栏选项
   * @param key - 选中的侧边栏选项
   */
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
