import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';

import { useSettingStore } from '@/store/setting';
import { getDesignToken } from './getDesignToken';

import { Theme, ThemeConfig, ThemeContextValue, ThemeMode } from './types';
import { darkAlgorithm } from '../algorithm/dark';
import { lightAlgorithm } from '../algorithm/light';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation(['setting']);

  // 检查是否已经在 ThemeProvider 内部（嵌套情况）
  const parentContext = useContext(ThemeContext);
  const isNested = !!parentContext;

  // 如果是嵌套的 ThemeProvider 且提供了自定义主题，则优先使用自定义主题
  // 否则从 store 获取配置或使用父级配置
  const {
    themeMode,
    setThemeMode: setStoreThemeMode,
    primaryColor,
    neutralColor,
    fontSize,
  } = useSettingStore();

  // 计算当前实际的主题模式
  const getActualThemeMode = (): 'light' | 'dark' => {
    // 如果是嵌套的 ThemeProvider 且有自定义主题配置，优先使用父级的模式判断
    if (isNested && customTheme) {
      // 如果自定义主题没有指定算法，则继承父级的模式
      if (!customTheme.algorithm) {
        return parentContext.theme.isDark ? 'dark' : 'light';
      }
      // 如果自定义主题指定了算法，则根据算法判断
      const algorithm = Array.isArray(customTheme.algorithm)
        ? customTheme.algorithm[0]
        : customTheme.algorithm;
      return algorithm === darkAlgorithm ? 'dark' : 'light';
    }

    // 非嵌套情况或嵌套但没有自定义主题，使用正常逻辑
    if (themeMode === 'auto') {
      return systemColorScheme || 'light';
    }
    return themeMode;
  };

  // 设置主题模式
  const setThemeModeHandler = (mode: ThemeMode) => {
    // 如果是嵌套的 ThemeProvider 且有自定义主题，不允许修改主题模式
    if (isNested && customTheme) {
      console.warn('Cannot change theme mode in nested ThemeProvider with custom theme');
      return;
    }
    setStoreThemeMode(mode);
  };

  const getThemeModeDisplayName = () => {
    if (themeMode === 'auto') {
      return t('themeMode.auto', { ns: 'setting' });
    }
    return t(`themeMode.${themeMode}`, { ns: 'setting' });
  };

  // 切换主题（在 light 和 dark 之间切换）
  const toggleTheme = () => {
    // 如果是嵌套的 ThemeProvider 且有自定义主题，不允许切换主题
    if (isNested && customTheme) {
      console.warn('Cannot toggle theme in nested ThemeProvider with custom theme');
      return;
    }

    const currentMode = getActualThemeMode();
    const newMode: ThemeMode = currentMode === 'light' ? 'dark' : 'light';
    setThemeModeHandler(newMode);
  };

  // 生成主题对象
  const isDark = getActualThemeMode() === 'dark';

  // 合并主题配置的优先级策略
  let mergedThemeConfig: ThemeConfig;

  if (isNested && customTheme) {
    // 嵌套情况：子 ThemeProvider 的自定义配置优先
    mergedThemeConfig = {
      algorithm: customTheme.algorithm || (isDark ? darkAlgorithm : lightAlgorithm),
      token: {
        // 继承父级的 token 作为基础
        ...parentContext.theme.token,
        // 子 ThemeProvider 的自定义 token 覆盖
        ...customTheme.token,
      },
    };
  } else if (isNested && !customTheme) {
    // 嵌套但没有自定义主题：直接继承父级配置
    return <ThemeContext.Provider value={parentContext}>{children}</ThemeContext.Provider>;
  } else {
    // 非嵌套情况：使用正常的合并逻辑
    mergedThemeConfig = {
      algorithm: isDark ? darkAlgorithm : lightAlgorithm,
      token: {
        fontSize,
        neutralColor,
        primaryColor,
        ...customTheme?.token,
      },
    };
  }

  // 使用合并后的配置生成主题
  const themeToken = getDesignToken(mergedThemeConfig);

  const theme: Theme = {
    isDark,
    mode: isNested && customTheme ? (isDark ? 'dark' : 'light') : themeMode,
    token: themeToken,
  };

  const contextValue: ThemeContextValue = {
    getThemeModeDisplayName,
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
