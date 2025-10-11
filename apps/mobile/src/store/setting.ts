import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import { DEFAULT_SERVER_URL, formatServerUrl } from '@/config/server';
import { NeutralColors, PrimaryColors, ThemeMode } from '@/theme';
import { isDev } from '@/utils/env';

interface SettingState {
  // 开发者模式相关
  customServerUrl: string | null;
  developerMode: boolean;
  fontSize: number;
  neutralColor: NeutralColors;
  // 主题自定义配置
  primaryColor: PrimaryColors;
  setCustomServerUrl: (url: string | null) => void;
  setDeveloperMode: (enabled: boolean) => void;
  setFontSize: (size: number) => void;
  setNeutralColor: (color: NeutralColors) => void;
  setPrimaryColor: (color: PrimaryColors) => void;
  setShowSelfHostedEntry: (enabled: boolean) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  showSelfHostedEntry: boolean;
  themeMode: ThemeMode;
}

export const useSettingStore = createWithEqualityFn<SettingState>()(
  persist(
    (set) => ({
      customServerUrl: null,

      // 开发者模式默认只在开发环境开启
      developerMode: isDev,

      // 默认字体大小
      fontSize: 14,

      // 默认中性色
      neutralColor: 'mauve',

      // 默认主色
      primaryColor: 'primary',

      setCustomServerUrl: (customServerUrl: string | null) => {
        const value = customServerUrl ? formatServerUrl(customServerUrl) : null;
        // Avoid persisting official URL as custom override
        const normalizedDefault = formatServerUrl(DEFAULT_SERVER_URL);
        set({
          customServerUrl: value && value !== normalizedDefault && value.length > 0 ? value : null,
        });
      },

      setDeveloperMode: (developerMode: boolean) => {
        set({ developerMode });
      },

      setFontSize: (fontSize: number) => {
        set({ fontSize });
      },

      setNeutralColor: (neutralColor: NeutralColors) => {
        set({ neutralColor });
      },

      setPrimaryColor: (primaryColor: PrimaryColors) => {
        set({ primaryColor });
      },

      setShowSelfHostedEntry: (showSelfHostedEntry: boolean) => {
        set({ showSelfHostedEntry });
      },

      setThemeMode: (themeMode: ThemeMode) => {
        set({ themeMode });
      },

      // 是否显示自托管登录入口, 默认关闭
      showSelfHostedEntry: false,

      themeMode: 'auto',
    }),
    {
      name: 'lobe-chat-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
  shallow,
);
