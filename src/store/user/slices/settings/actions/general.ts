import { ThemeMode } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { DeepPartial } from 'utility-types';
import type { StateCreator } from 'zustand/vanilla';

import { userService } from '@/services/user';
import type { UserStore } from '@/store/user';
import { LocaleMode } from '@/types/locale';
import { LobeAgentSettings } from '@/types/session';
import { GlobalSettings } from '@/types/settings';
import { switchLang } from '@/utils/client/switchLang';
import { difference } from '@/utils/difference';
import { merge } from '@/utils/merge';

export interface GeneralSettingsAction {
  importAppSettings: (settings: GlobalSettings) => Promise<void>;
  resetSettings: () => Promise<void>;
  setSettings: (settings: DeepPartial<GlobalSettings>) => Promise<void>;
  switchLocale: (locale: LocaleMode) => Promise<void>;
  switchThemeMode: (themeMode: ThemeMode) => Promise<void>;
  updateDefaultAgent: (agent: DeepPartial<LobeAgentSettings>) => Promise<void>;
}

export const generalSettingsSlice: StateCreator<
  UserStore,
  [['zustand/devtools', never]],
  [],
  GeneralSettingsAction
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
  setSettings: async (settings) => {
    const { settings: prevSetting, defaultSettings } = get();

    const nextSettings = merge(prevSetting, settings);

    if (isEqual(prevSetting, nextSettings)) return;

    const diffs = difference(nextSettings, defaultSettings);

    await userService.updateUserSettings(diffs);
    await get().refreshUserConfig();
  },
  switchLocale: async (locale) => {
    await get().setSettings({ language: locale });

    switchLang(locale);
  },
  switchThemeMode: async (themeMode) => {
    await get().setSettings({ themeMode });
  },
  updateDefaultAgent: async (defaultAgent) => {
    await get().setSettings({ defaultAgent });
  },
});
