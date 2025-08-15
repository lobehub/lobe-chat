import AsyncStorage from '@react-native-async-storage/async-storage';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { createJSONStorage, persist } from 'zustand/middleware';

import { ThemeMode } from '@/theme/types';

interface SettingState {
  // 主题自定义配置
  colorPrimary: string;
  fontSize: number;
  setColorPrimary: (color: string) => void;
  setFontSize: (size: number) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  themeMode: ThemeMode;
}

export const useSettingStore = createWithEqualityFn<SettingState>()(
  persist(
    (set) => ({
      // 默认主色
      colorPrimary: '#000000',

      // 默认字体大小
      fontSize: 14,

      setColorPrimary: (colorPrimary: string) => {
        set({ colorPrimary });
      },

      setFontSize: (fontSize: number) => {
        set({ fontSize });
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
