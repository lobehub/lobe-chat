// 导出基础类型
export * from './types';

// 导出接口类型
export type { AliasToken, MappingAlgorithm, MapToken, SeedToken } from './interface/index';

// 导出种子 Token
export { default as seedToken } from './seed';

// 导出算法
export { darkAlgorithm } from './algorithm/dark';
export { lightAlgorithm } from './algorithm/light';

// 导出主题 Provider 和相关功能
export { colorScales } from './color';
export * from './colorUtils';
export type { Theme, ThemeConfig, ThemeContextValue } from './ThemeProvider';
export { createStyles, ThemeProvider, useTheme, useThemeToken } from './ThemeProvider';
