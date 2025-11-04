import { ColorScaleItem, colorScales, neutralColorScales } from '../color';
import type { NeutralColors, PrimaryColors } from '../customTheme';
import { generateCustomToken } from '../customToken';
import { generateColorNeutralPalette, generateColorPalette } from '../generateColorPalette';
import type { MappingAlgorithm } from '../interface';
import lightBaseToken from '../token/light';
import genCommonMapToken from './shared/genCommonMapToken';
import genControlHeight from './shared/genControlHeight';
import genFontMapToken from './shared/genFontMapToken';
import genSizeMapToken from './shared/genSizeMapToken';

export const lightAlgorithm: MappingAlgorithm = (seedToken, mapToken) => {
  const primaryColor = (seedToken as any).primaryColor as PrimaryColors;
  const neutralColor = (seedToken as any).neutralColor as NeutralColors;

  let primaryTokens = {};
  let neutralTokens = {};
  const primaryScale: ColorScaleItem = colorScales[primaryColor];

  if (primaryScale) {
    primaryTokens = generateColorPalette({
      appearance: 'light',
      scale: primaryScale,
      type: 'Primary',
    });
  }

  const neutralScale = neutralColorScales[neutralColor];
  if (neutralScale) {
    neutralTokens = generateColorNeutralPalette({ appearance: 'light', scale: neutralScale });
  }

  // 先生成基础 token（不包含数字色阶）
  const baseMapToken = {
    ...genSizeMapToken(seedToken),
    ...genControlHeight(seedToken),
    ...genFontMapToken(seedToken.fontSize),
    ...genCommonMapToken(seedToken),
    ...mapToken!,
    ...lightBaseToken,
    ...primaryTokens,
    ...neutralTokens,
  };

  // 生成所有颜色的数字色阶（red1-red11 等）
  const customToken = generateCustomToken({
    isDarkMode: false,
    token: baseMapToken as any,
  });

  // 关键：先应用数字色阶，再用 primaryTokens 和 neutralTokens 覆盖
  // 这样自定义主题色会覆盖数字色阶中的对应颜色
  return {
    ...baseMapToken,
    ...customToken,
    // 再次应用自定义颜色，确保它们覆盖数字色阶
    ...primaryTokens,
    ...neutralTokens,
  };
};
