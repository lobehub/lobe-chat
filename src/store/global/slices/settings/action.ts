import { ThemeMode } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { produce } from 'immer';
import { DeepPartial } from 'utility-types';
import type { StateCreator } from 'zustand/vanilla';

import { DEFAULT_AGENT, DEFAULT_SETTINGS } from '@/const/settings';
import type { GlobalStore } from '@/store/global';
import { SettingsTabs } from '@/store/global/initialState';
import { LobeAgentSettings } from '@/types/session';
import type { GlobalSettings, OpenAIConfig } from '@/types/settings';
import { merge } from '@/utils/merge';
import { setNamespace } from '@/utils/storeDebug';

const n = setNamespace('settings');

/**
 * 设置操作
 */
export interface SettingsAction {
  importAppSettings: (settings: GlobalSettings) => void;
  /**
   * 重置设置
   */
  resetSettings: () => void;
  setOpenAIConfig: (config: Partial<OpenAIConfig>) => void;
  /**
   * 设置部分配置设置
   * @param settings - 部分配置设置
   */
  setSettings: (settings: DeepPartial<GlobalSettings>) => void;

  switchSettingTabs: (tab: SettingsTabs) => void;
  /**
   * 设置主题模式
   * @param themeMode - 主题模式
   */
  switchThemeMode: (themeMode: ThemeMode) => void;
  updateDefaultAgent: (agent: DeepPartial<LobeAgentSettings>) => void;
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
    const { password: _, ...settings } = importAppSettings;

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
    set({ settings }, false, n('resetDefaultAgent'));
  },
  resetSettings: () => {
    set({ settings: DEFAULT_SETTINGS }, false, n('resetSettings'));
  },
  setOpenAIConfig: (config) => {
    get().setSettings({ languageModel: { openAI: config } });
  },
  setSettings: (settings) => {
    const prevSetting = get().settings;
    const nextSettings = merge(prevSetting, settings);

    if (isEqual(prevSetting, nextSettings)) return;

    set({ settings: merge(prevSetting, settings) }, false, n('setSettings', settings));
  },

  switchSettingTabs: (tab) => {
    set({ settingsTab: tab });
  },
  switchThemeMode: (themeMode) => {
    get().setSettings({ themeMode });
  },
  updateDefaultAgent: (agent) => {
    const settings = produce(get().settings, (draft: GlobalSettings) => {
      draft.defaultAgent = merge(draft.defaultAgent, agent);
    });

    set({ settings }, false, n('updateDefaultAgent', agent));
  },
});
