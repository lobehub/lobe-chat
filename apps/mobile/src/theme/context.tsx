import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';

import { useSettingStore } from '@/store/setting';
import type { Theme, ThemeConfig, ThemeContextValue, ThemeMode } from '@/types/theme';

import { generateDesignToken } from './tokens';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  /**
   * 自定义主题配置
   * 当提供此属性时，将使用自定义配置生成主题
   * 包含 token（种子 Token）和 algorithm（主题算法）
   */
  theme?: ThemeConfig;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, theme: customTheme }) => {
  const systemColorScheme = useColorScheme();
  const { themeMode, setThemeMode: setStoreThemeMode } = useSettingStore();

  // 计算当前实际的主题模式
  const getActualThemeMode = (): 'light' | 'dark' => {
    if (themeMode === 'auto') {
      return systemColorScheme || 'light';
    }
    return themeMode;
  };

  // 设置主题模式
  const setThemeModeHandler = (mode: ThemeMode) => {
    setStoreThemeMode(mode);
  };

  // 切换主题（在 light 和 dark 之间切换）
  const toggleTheme = () => {
    const currentMode = getActualThemeMode();
    const newMode: ThemeMode = currentMode === 'light' ? 'dark' : 'light';
    setThemeModeHandler(newMode);
  };

  // 生成主题对象
  const isDark = getActualThemeMode() === 'dark';

  // 如果提供了自定义主题配置，使用它；否则使用默认配置
  const themeToken = generateDesignToken(customTheme, isDark);

  const theme: Theme = {
    isDark,
    mode: themeMode,
    token: themeToken,
  };

  const contextValue: ThemeContextValue = {
    setThemeMode: setThemeModeHandler,
    theme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

// 使用主题的 Hook
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// 获取主题 token 的便捷 Hook
export const useThemeToken = () => {
  const { theme } = useTheme();
  return theme.token;
};
