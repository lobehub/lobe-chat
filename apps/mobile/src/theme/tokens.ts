import type { AliasToken, SeedToken, ThemeConfig } from '@/types/theme';

import { darkAlgorithm, defaultAlgorithm } from './algorithms';
import { formatToken } from './alias';
import seedToken from './seed';

/**
 * 生成设计 Token
 * 参考 Ant Design 的主题系统架构
 */
export function generateDesignToken(config?: ThemeConfig, isDark: boolean = false): AliasToken {
  // 合并种子 Token
  const mergedSeedToken: SeedToken = {
    ...seedToken,
    ...config?.token,
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
