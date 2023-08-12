import { ThemeMode } from 'antd-style';
import { produce } from 'immer';
import { merge } from 'lodash-es';
import type { StateCreator } from 'zustand/vanilla';

import { DEFAULT_AGENT, DEFAULT_SETTINGS } from '@/const/settings';
import type { GlobalSettings } from '@/types/settings';
import { setNamespace } from '@/utils/storeDebug';

import type { GlobalStore } from '../store';

const t = setNamespace('settings');

/**
 * 设置操作
 */
export interface SettingsAction {
  importAppSettings: (settings: GlobalSettings) => void;
  /**
   * 重置设置
   */
  resetSettings: () => void;
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
}

export const createSettingsSlice: StateCreator<
  GlobalStore,
  [['zustand/devtools', never]],
  [],
  SettingsAction
> = (set, get) => ({
  importAppSettings: (importAppSettings) => {
    const { setSettings } = get();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { OPENAI_API_KEY: _, password: __, ...settings } = importAppSettings;

    setSettings({
      ...settings,
      // 如果用户存在用户头像，那么不做导入
      avatar: !get().settings.avatar ? settings.avatar : get().settings.avatar,
    });
  },
  resetDefaultAgent: () => {
    const settings = produce(get().settings, (draft: GlobalSettings) => {
      draft.defaultAgent = DEFAULT_AGENT;
    });
    set({ settings }, false, t('resetDefaultAgent'));
  },
  resetSettings: () => {
    set({ settings: DEFAULT_SETTINGS }, false, t('resetSettings'));
  },

  setSettings: (settings) => {
    const oldSetting = get().settings;
    set({ settings: merge(oldSetting, settings) }, false, t('setSettings', settings));
  },
  setThemeMode: (themeMode) => {
    get().setSettings({ themeMode });
  },
});
