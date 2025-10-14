// ======================================================================
// ==                           Theme                                   ==
import { AliasToken, MappingAlgorithm } from '@/components/styles';

export type ThemeAppearance = 'dark' | 'light';

export type ThemeMode = 'light' | 'dark' | 'auto';

// ======================================================================
export interface Theme {
  isDarkMode: boolean;
  themeMode: ThemeMode;
  token: AliasToken;
}

export interface ThemeContextValue extends Theme {
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

// 主题配置
export interface ThemeConfig {
  algorithm?: MappingAlgorithm | MappingAlgorithm[];
  token?: Partial<AliasToken>;
}
