import type { AliasToken, SeedToken, ThemeConfig } from '@/types/theme';

import { darkAlgorithm, defaultAlgorithm } from './algorithms';
import { formatToken } from './alias';
import { defaultSeedToken } from './seed';

/**
 * 生成设计 Token
 * 参考 Ant Design 的主题系统架构
 */
export function generateDesignToken(config?: ThemeConfig, isDark: boolean = false): AliasToken {
  // 合并种子 Token
  const mergedSeedToken: SeedToken = {
    ...defaultSeedToken,
    ...config?.token,
    // 确保中性色基础颜色根据主题模式设置
    colorBgBase: config?.token?.colorBgBase || (isDark ? '#000000' : '#ffffff'),
    colorTextBase: config?.token?.colorTextBase || (isDark ? '#ffffff' : '#000000'),
  };

  // 选择算法
  const algorithm = config?.algorithm || (isDark ? darkAlgorithm : defaultAlgorithm);

  // 如果是数组算法，依次应用
  const mapToken = Array.isArray(algorithm)
    ? algorithm.reduce((token, alg) => {
        // 第一次应用时，token 是 SeedToken，之后是 MapToken
        return alg(token as SeedToken);
      }, mergedSeedToken as any)
    : algorithm(mergedSeedToken);

  // 格式化为别名 Token
  return formatToken(mapToken);
}

/**
 * 生成主题 Token（兼容旧版本）
 */
export const generateThemeToken = (isDark: boolean): AliasToken => {
  return generateDesignToken(
    {
      token: {
        colorPrimary: 'rgba(0, 0, 0, 0)', // 使用透明色作为主色
      },
    },
    isDark,
  );
};
