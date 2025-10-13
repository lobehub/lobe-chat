import { camelCase } from 'lodash-es';
import { mix } from 'polished';

import { colorScales } from './color';
import { generateColorPalette } from './generateColorPalette';
import type { AliasToken } from './interface';
import type { LobeCustomToken } from './interface/presetColors';

/**
 * 生成单个颜色的完整调色板
 * 包含：数字色阶 + 语义化颜色
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
  const colorStepPalette: Record<string, string> = {};

  // 生成数字色阶 (1-11)，跳过索引 0 和 12（与 @lobehub/ui 对齐）
  for (const [index, color] of scale[appearance].entries()) {
    if (index === 0 || index === 12) continue;
    colorStepPalette[`${name}${index}`] = color;
  }

  // 生成Alpha色阶 (1A-11A)，跳过索引 0 和 12
  for (const [index, color] of scale[`${appearance}A`].entries()) {
    if (index === 0 || index === 12) continue;
    colorStepPalette[`${name}${index}A`] = color;
  }

  // 生成语义化颜色（复用 generateColorPalette）
  const semanticColors = generateColorPalette({
    appearance,
    scale,
    type: name,
  });

  return { ...colorStepPalette, ...semanticColors };
};

/**
 * 生成自定义 Token
 * React Native 适配版本，对齐 @lobehub/ui
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
