import { ThemeMode } from 'antd-style';
import type { StateCreator } from 'zustand/vanilla';

import type { GlobalSettings } from '@/types/settings';

import type { SidebarTabKey } from './initialState';
import { DEFAULT_SETTINGS, SettingsState } from './initialState';
import type { SettingsStore } from './store';

/**
 * 设置操作
 */
export interface SettingsAction {
  importSettings: (settings: GlobalSettings) => void;
  /**
   * 重置设置
   */
  resetSettings: () => void;
  /**
   * 设置全局设置
   * @param settings - 全局设置
   */
  setGlobalSettings: (settings: SettingsState) => void;
  /**
   * 设置部分配置设置
   * @param settings - 部分配置设置
   */
  setSettings: (settings: Partial<GlobalSettings>) => void;
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
  importSettings: (importSettings) => {
    const { setSettings } = get();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { OPENAI_API_KEY: _, password: __, ...settings } = importSettings;

    setSettings(settings);
  },
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
