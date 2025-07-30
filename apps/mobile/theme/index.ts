// 导出主题相关的类型
export type {
  AliasToken,
  MappingAlgorithm,
  MapToken,
  SeedToken,
  Theme,
  ThemeConfig,
  ThemeContextValue,
  ThemeMode,
} from '@/mobile/types/theme';

// 导出主题上下文和 Hooks
export { ThemeProvider, useTheme, useThemeToken } from './context';

// 导出主题生成函数
export { generateDesignToken, generateThemeToken } from './tokens';

// 导出算法
export {
  compactAlgorithm,
  compactDarkAlgorithm,
  darkAlgorithm,
  defaultAlgorithm,
} from './algorithms';

// 导出种子 Token
export { defaultSeedToken } from './seed';

// 导出工具函数
export {
  adjustBrightness,
  createThemedStyle,
  generateColorPalette,
  generateNeutralColorPalette,
  generateRadius,
  getAlphaColor,
  getFontSizes,
  getLineHeight,
  mixColor,
  parseColor,
  setAlpha,
  toHexString,
  toRgbaString,
} from './colorUtils';

// 导出React hook工具函数
export { useThemeUtils } from './hooks';

// 导出格式化函数
export { formatToken } from './alias';

// 导出样式创建函数
export { createStyles } from './createStyles';
