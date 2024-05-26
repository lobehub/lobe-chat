import { ThemeMode } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { DeepPartial } from 'utility-types';
import type { StateCreator } from 'zustand/vanilla';

import { userService } from '@/services/user';
import type { UserStore } from '@/store/user';
import { LocaleMode } from '@/types/locale';
import { LobeAgentSettings } from '@/types/session';
import { UserGeneralConfig, UserKeyVaults, UserSettings } from '@/types/user/settings';
import { switchLang } from '@/utils/client/switchLang';
import { difference } from '@/utils/difference';
import { merge } from '@/utils/merge';

export interface UserSettingsAction {
  importAppSettings: (settings: UserSettings) => Promise<void>;
  resetSettings: () => Promise<void>;
  setSettings: (settings: DeepPartial<UserSettings>) => Promise<void>;
  setTranslationSystemAgent: (provider: string, model: string) => Promise<void>;
  switchLocale: (locale: LocaleMode) => Promise<void>;
  switchThemeMode: (themeMode: ThemeMode) => Promise<void>;
  updateDefaultAgent: (agent: DeepPartial<LobeAgentSettings>) => Promise<void>;
  updateGeneralConfig: (settings: Partial<UserGeneralConfig>) => Promise<void>;
  updateKeyVaults: (settings: Partial<UserKeyVaults>) => Promise<void>;
}

export const createSettingsSlice: StateCreator<
  UserStore,
  [['zustand/devtools', never]],
  [],
  UserSettingsAction
> = (set, get) => ({
  importAppSettings: async (importAppSettings) => {
    const { setSettings } = get();

    await setSettings(importAppSettings);
  },
  resetSettings: async () => {
    await userService.resetUserSettings();
    await get().refreshUserState();
  },
  setSettings: async (settings) => {
    const { settings: prevSetting, defaultSettings } = get();

    const nextSettings = merge(prevSetting, settings);

    if (isEqual(prevSetting, nextSettings)) return;

    const diffs = difference(nextSettings, defaultSettings);

    await userService.updateUserSettings(diffs);
    await get().refreshUserState();
  },
  setTranslationSystemAgent: async (provider, model) => {
    await get().setSettings({
      systemAgent: {
        translation: {
          model: model,
          provider: provider,
        },
      },
    });
  },
  switchLocale: async (locale) => {
    await get().updateGeneralConfig({ language: locale });

    switchLang(locale);
  },
  switchThemeMode: async (themeMode) => {
    await get().updateGeneralConfig({ themeMode });
  },
  updateDefaultAgent: async (defaultAgent) => {
    await get().setSettings({ defaultAgent });
  },
  updateGeneralConfig: async (general) => {
    await get().setSettings({ general });
  },
  updateKeyVaults: async (keyVaults) => {
    await get().setSettings({ keyVaults });
  },
});
