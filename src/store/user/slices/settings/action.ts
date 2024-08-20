import { ThemeMode } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { DeepPartial } from 'utility-types';
import type { StateCreator } from 'zustand/vanilla';

import { MESSAGE_CANCEL_FLAT } from '@/const/message';
import { shareService } from '@/services/share';
import { userService } from '@/services/user';
import type { UserStore } from '@/store/user';
import { LocaleMode } from '@/types/locale';
import { LobeAgentSettings } from '@/types/session';
import {
  SystemAgentItem,
  UserGeneralConfig,
  UserKeyVaults,
  UserSettings,
  UserSystemAgentConfigKey,
} from '@/types/user/settings';
import { switchLang } from '@/utils/client/switchLang';
import { difference } from '@/utils/difference';
import { merge } from '@/utils/merge';

export interface UserSettingsAction {
  importAppSettings: (settings: UserSettings) => Promise<void>;
  importUrlShareSettings: (settingsParams: string | null) => Promise<void>;
  internal_createSignal: () => AbortController;
  resetSettings: () => Promise<void>;
  setSettings: (settings: DeepPartial<UserSettings>) => Promise<void>;
  switchLocale: (locale: LocaleMode) => Promise<void>;
  switchThemeMode: (themeMode: ThemeMode) => Promise<void>;
  updateDefaultAgent: (agent: DeepPartial<LobeAgentSettings>) => Promise<void>;
  updateGeneralConfig: (settings: Partial<UserGeneralConfig>) => Promise<void>;
  updateKeyVaults: (settings: Partial<UserKeyVaults>) => Promise<void>;

  updateSystemAgent: (key: UserSystemAgentConfigKey, value: SystemAgentItem) => Promise<void>;
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

  /**
   * Import settings from a string in json format
   */
  importUrlShareSettings: async (settingsParams: string | null) => {
    if (settingsParams) {
      const importSettings = shareService.decodeShareSettings(settingsParams);
      if (importSettings?.message || !importSettings?.data) {
        // handle some error
        return;
      }

      await get().setSettings(importSettings.data);
    }
  },

  internal_createSignal: () => {
    const abortController = get().updateSettingsSignal;
    if (abortController && !abortController.signal.aborted)
      abortController.abort(MESSAGE_CANCEL_FLAT);

    const newSignal = new AbortController();

    set({ updateSettingsSignal: newSignal }, false, 'signalForUpdateSettings');

    return newSignal;
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
    set({ settings: diffs }, false, 'optimistic_updateSettings');

    const abortController = get().internal_createSignal();
    await userService.updateUserSettings(diffs, abortController.signal);
    await get().refreshUserState();
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
  updateSystemAgent: async (key, { provider, model }) => {
    await get().setSettings({
      systemAgent: { [key]: { model, provider } },
    });
  },
});
