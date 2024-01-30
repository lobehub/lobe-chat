import { ThemeMode } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { DeepPartial } from 'utility-types';
import type { StateCreator } from 'zustand/vanilla';

import { userService } from '@/services/user';
import type { GlobalStore } from '@/store/global';
import { SettingsTabs } from '@/store/global/initialState';
import { LobeAgentSettings } from '@/types/session';
import type { GlobalSettings, OpenAIConfig } from '@/types/settings';
import { difference } from '@/utils/difference';
import { merge } from '@/utils/merge';

/**
 * 设置操作
 */
export interface SettingsAction {
  importAppSettings: (settings: GlobalSettings) => Promise<void>;
  resetSettings: () => Promise<void>;
  setOpenAIConfig: (config: Partial<OpenAIConfig>) => Promise<void>;
  setSettings: (settings: DeepPartial<GlobalSettings>) => Promise<void>;
  switchSettingTabs: (tab: SettingsTabs) => void;
  switchThemeMode: (themeMode: ThemeMode) => Promise<void>;
  updateDefaultAgent: (agent: DeepPartial<LobeAgentSettings>) => Promise<void>;
}

export const createSettingsSlice: StateCreator<
  GlobalStore,
  [['zustand/devtools', never]],
  [],
  SettingsAction
> = (set, get) => ({
  importAppSettings: async (importAppSettings) => {
    const { setSettings } = get();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...settings } = importAppSettings;

    await setSettings(settings);
  },
  resetSettings: async () => {
    await userService.resetUserSettings();
    await get().refreshUserConfig();
  },
  setOpenAIConfig: async (config) => {
    await get().setSettings({ languageModel: { openAI: config } });
  },
  setSettings: async (settings) => {
    const { settings: prevSetting, defaultSettings } = get();

    const nextSettings = merge(prevSetting, settings);

    if (isEqual(prevSetting, nextSettings)) return;

    const diffs = difference(nextSettings, defaultSettings);

    await userService.updateUserSettings(diffs);
    await get().refreshUserConfig();
  },

  switchSettingTabs: (tab) => {
    set({ settingsTab: tab });
  },
  switchThemeMode: async (themeMode) => {
    await get().setSettings({ themeMode });
  },
  updateDefaultAgent: async (defaultAgent) => {
    await get().setSettings({ defaultAgent });
  },
});
