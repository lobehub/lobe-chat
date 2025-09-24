import { ColorScaleItem, colorScales, neutralColorScales } from '../../color';
import type { MappingAlgorithm } from '../../interface';
import genCommonMapToken from '../shared/genCommonMapToken';
import genControlHeight from '../shared/genControlHeight';
import genFontMapToken from '../shared/genFontMapToken';
import genSizeMapToken from '../shared/genSizeMapToken';
import {
  generateColorNeutralPalette,
  generateColorPalette,
  generateCustomColorPalettes,
} from '../shared/generateColorPalette';
import lightBaseToken from './color';

export const lightAlgorithm: MappingAlgorithm = (seedToken, mapToken) => {
  const primaryColor = seedToken.primaryColor;
  const neutralColor = seedToken.neutralColor;

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

  const colorPalettes = generateCustomColorPalettes({ appearance: 'light' });

  return {
    ...mapToken!,
    ...colorPalettes,
    ...lightBaseToken,
    ...primaryTokens,
    ...neutralTokens,
    // Font
    ...genFontMapToken(seedToken.fontSize),
    // Size
    ...genSizeMapToken(seedToken),
    // Height
    ...genControlHeight(seedToken),
    // Others
    ...genCommonMapToken(seedToken),
  };
};
