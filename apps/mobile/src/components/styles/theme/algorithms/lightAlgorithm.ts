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

  // 生成完整的 MapToken 基础对象
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

  // 生成所有颜色的完整调色板（包括数字色阶 1-11 和 Alpha 色阶）
  const customToken = generateCustomToken({
    isDarkMode: false,
    token: baseMapToken as any,
  });

  return {
    ...baseMapToken,
    ...customToken,
  };
};
