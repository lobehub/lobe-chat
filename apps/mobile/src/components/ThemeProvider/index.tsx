// 导出主题 Provider 和相关功能
export { ThemeProvider, useTheme, useThemeToken } from '@/theme/context';

// 导出主题相关类型
export type {
  AliasToken,
  MappingAlgorithm,
  SeedToken,
  Theme,
  ThemeConfig,
  ThemeContextValue,
  ThemeMode,
} from '@/types/theme';

// 导出算法
export {
  compactAlgorithm,
  compactDarkAlgorithm,
  darkAlgorithm,
  defaultAlgorithm,
} from '@/theme/algorithms';
