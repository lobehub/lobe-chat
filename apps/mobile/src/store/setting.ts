import AsyncStorage from '@react-native-async-storage/async-storage';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { createJSONStorage, persist } from 'zustand/middleware';

import { PrimaryColors, ThemeMode } from '@/theme';

interface SettingState {
  fontSize: number;
  // 主题自定义配置
  primaryColor: PrimaryColors;
  setFontSize: (size: number) => void;
  setPrimaryColor: (color: PrimaryColors) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  themeMode: ThemeMode;
}

export const useSettingStore = createWithEqualityFn<SettingState>()(
  persist(
    (set) => ({
      // 默认字体大小
      fontSize: 14,

      // 默认主色
      primaryColor: 'primary',

      setFontSize: (fontSize: number) => {
        set({ fontSize });
      },

      setPrimaryColor: (primaryColor: PrimaryColors) => {
        set({ primaryColor });
      },

      setThemeMode: (themeMode: ThemeMode) => {
        set({ themeMode });
      },

      themeMode: 'auto',
    }),
    {
      name: 'lobe-chat-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
  shallow,
);
