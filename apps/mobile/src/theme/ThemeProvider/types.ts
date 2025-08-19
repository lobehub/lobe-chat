// ======================================================================
// ==                           Theme                                   ==

import { AliasToken, MappingAlgorithm } from '@/theme';

export type ThemeAppearance = 'dark' | 'light';

export type ThemeMode = 'light' | 'dark' | 'auto';

// ======================================================================
export interface Theme {
  isDark: boolean;
  mode: ThemeMode;
  token: AliasToken;
}

export interface ThemeContextValue {
  setThemeMode: (mode: ThemeMode) => void;
  theme: Theme;
  toggleTheme: () => void;
}

// 主题配置
export interface ThemeConfig {
  algorithm?: MappingAlgorithm | MappingAlgorithm[];
  token?: Partial<AliasToken>;
}
