import path from 'node:path';

// 目录路径常量
export const ROOT_DIR = path.resolve(__dirname, '../../');
export const COMPONENTS_DIR = path.resolve(ROOT_DIR, 'src/components');
export const THEME_DIR = path.resolve(ROOT_DIR, 'src/theme');
export const OUTPUT_PATH = path.resolve(ROOT_DIR, 'app/playground/.data/index.json');
export const DEMOS_MAP_PATH = path.resolve(ROOT_DIR, 'app/playground/.data/import.ts');

// 特殊组件的 demos 路径配置
export const SPECIAL_DEMOS_PATHS: Record<string, string> = {
  // ThemeProvider: '@/theme/ThemeProvider/demos',
  // ThemeToken: '@/components/theme/theme-token',
};
