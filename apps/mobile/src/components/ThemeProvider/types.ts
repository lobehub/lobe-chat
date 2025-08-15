// ======================================================================
// ==                           Theme                                   ==

import { AliasToken, MappingAlgorithm, ThemeMode } from '@/theme';

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
