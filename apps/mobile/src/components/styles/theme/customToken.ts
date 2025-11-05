import { camelCase } from 'lodash-es';
import { mix } from 'polished';

import { colorScales } from './color';
import { generateColorPalette } from './generateColorPalette';
import type { AliasToken } from './interface';
import type { LobeCustomToken } from './interface/presetColors';

// 动态导入 storage，避免在非移动端环境报错
let cacheStorage: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  cacheStorage = require('@/utils/storage').cacheStorage;
} catch {
  // 非移动端环境（如测试）忽略
}

// 三层缓存策略：
// L1: Map 缓存（内存层，极快，进程级别）
// L2: MMKV 缓存（持久层，应用重启后仍可用，快速）
// L3: 计算生成（最慢）

// L1 内存缓存
const colorPaletteCache = new Map<string, any>();

// MMKV 缓存键前缀和版本（版本变更时自动失效旧缓存）
const CACHE_VERSION = '1.2.0'; // 增加版本号：添加不带 color 前缀的语义化 token
const CACHE_KEY_PREFIX = `theme-color-palette-v${CACHE_VERSION}`;

/**
 * 生成单个颜色的完整调色板
 * 包含：数字色阶 + 语义化颜色
 *
 * 性能优化：三层缓存策略
 * - L1: Map 缓存（内存）- 应用运行时有效，极快
 * - L2: MMKV 缓存（持久）- 应用重启后仍有效，快速
 * - L3: 计算生成（最慢）
 */
const generateCustomColorPalette = ({
  name,
  scale,
  appearance,
}: {
  appearance: 'dark' | 'light';
  name: string;
  scale: any;
}): any => {
  const cacheKey = `${name}-${appearance}`;

  // L1: 检查内存缓存（最快）
  if (colorPaletteCache.has(cacheKey)) {
    return colorPaletteCache.get(cacheKey);
  }

  // L2: 检查 MMKV 持久缓存
  if (cacheStorage) {
    try {
      const mmkvKey = `${CACHE_KEY_PREFIX}-${cacheKey}`;
      const cached = cacheStorage.getString(mmkvKey);
      if (cached) {
        const result = JSON.parse(cached);
        // 回填到 L1 内存缓存
        colorPaletteCache.set(cacheKey, result);
        return result;
      }
    } catch (error) {
      // MMKV 读取失败，继续计算生成
      console.warn('[Theme] Failed to read color palette from MMKV:', error);
    }
  }

  // L3: 缓存未命中，计算生成新的 token
  const colorStepPalette: Record<string, string> = {};

  // 生成数字色阶 (1-11)，跳过索引 0 和 12（与 @lobehub/ui 对齐）
  for (let index = 1; index <= 11; index++) {
    colorStepPalette[`${name}${index}`] = scale[appearance][index];
  }

  // 生成 Alpha 色阶 (1A-11A)，跳过索引 0 和 12
  for (let index = 1; index <= 11; index++) {
    colorStepPalette[`${name}${index}A`] = scale[`${appearance}A`][index];
  }

  // 生成语义化颜色（复用 generateColorPalette）
  const semanticColors = generateColorPalette({
    appearance,
    scale,
    type: name,
  });

  // 生成不带 color 前缀的语义化 token（用于 Tag 等组件）
  // 例如：redFillTertiary, blueBorder 等
  const semanticColorsWithoutPrefix: Record<string, string> = {};
  Object.entries(semanticColors).forEach(([key, value]) => {
    // 移除 'color' 前缀，例如 'colorRedFillTertiary' => 'redFillTertiary'
    if (key.startsWith('color')) {
      const keyWithoutPrefix = key.slice(5); // 移除 'color'
      // 将首字母小写，例如 'RedFillTertiary' => 'redFillTertiary'
      const finalKey = keyWithoutPrefix.charAt(0).toLowerCase() + keyWithoutPrefix.slice(1);
      semanticColorsWithoutPrefix[finalKey] = value as string;
    }
  });

  const result = { ...colorStepPalette, ...semanticColors, ...semanticColorsWithoutPrefix };

  // 写入 L1 内存缓存
  colorPaletteCache.set(cacheKey, result);

  // 写入 L2 MMKV 持久化缓存
  if (cacheStorage) {
    try {
      const mmkvKey = `${CACHE_KEY_PREFIX}-${cacheKey}`;
      cacheStorage.set(mmkvKey, JSON.stringify(result));
    } catch (error) {
      // MMKV 写入失败不影响功能
      console.warn('[Theme] Failed to write color palette to MMKV:', error);
    }
  }

  return result;
};

/**
 * 生成自定义 Token
 * React Native 适配版本，对齐 @lobehub/ui
 *
 * 性能优化：
 * - generateCustomColorPalette 内部已经实现了三层缓存
 * - 颜色 scale 是静态的，可以安全缓存
 * - 只有 colorBgContainerSecondary 需要动态计算（依赖 token）
 */
export const generateCustomToken = ({
  isDarkMode,
  token,
}: {
  isDarkMode: boolean;
  token: AliasToken;
}): LobeCustomToken => {
  let colorCustomToken: any = {};

  // 遍历所有颜色 scale，生成完整调色板
  // generateCustomColorPalette 内部已经做了三层缓存
  for (const [type, scale] of Object.entries(colorScales)) {
    colorCustomToken = {
      ...colorCustomToken,
      ...generateCustomColorPalette({
        appearance: isDarkMode ? 'dark' : 'light',
        name: camelCase(type),
        scale,
      }),
    };
  }

  return {
    ...colorCustomToken,
    colorBgContainerSecondary: mix(0.5, token.colorBgLayout, token.colorBgContainer),
  } as LobeCustomToken;
};

/**
 * 清理主题颜色缓存
 * 用于开发调试或版本更新后清理旧缓存
 *
 * 使用场景：
 * - 切换主题色后显示不正确
 * - App 更新后需要清理旧缓存
 * - 开发调试时需要强制重新生成
 *
 * @example
 * ```ts
 * import { clearThemeColorCache } from '@/components/styles';
 *
 * // 在设置页面添加清理缓存按钮
 * clearThemeColorCache();
 * ```
 */
export const clearThemeColorCache = () => {
  console.log('[Theme] Clearing color token cache...');

  // 清理 L1 内存缓存
  const cacheSize = colorPaletteCache.size;
  colorPaletteCache.clear();
  console.log(`[Theme] Cleared ${cacheSize} items from L1 memory cache`);

  // 清理 L2 MMKV 持久缓存
  if (cacheStorage) {
    try {
      const allKeys = cacheStorage.getAllKeys();
      let clearedCount = 0;
      // 删除所有主题颜色相关的缓存
      allKeys.forEach((key: string) => {
        if (key.startsWith('theme-color-')) {
          cacheStorage.delete(key);
          clearedCount++;
        }
      });
      console.log(`[Theme] Cleared ${clearedCount} items from L2 MMKV cache`);
    } catch (error) {
      console.warn('[Theme] Failed to clear MMKV cache:', error);
    }
  }

  console.log('[Theme] Cache cleared successfully');
};
