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
import darkBaseToken from './color';

export const darkAlgorithm: MappingAlgorithm = (seedToken, mapToken) => {
  const primaryColor = seedToken.primaryColor;
  const neutralColor = seedToken.neutralColor;

  let primaryTokens = {};
  let neutralTokens = {};

  // generate primary color Token with colorPrimary
  const primaryScale: ColorScaleItem = colorScales[primaryColor];

  if (primaryScale) {
    primaryTokens = generateColorPalette({
      appearance: 'dark',
      scale: primaryScale,
      type: 'Primary',
    });
  }

  // generate neutral color Token with colorBgBase
  const neutralScale = neutralColorScales[neutralColor];
  if (neutralScale) {
    neutralTokens = generateColorNeutralPalette({ appearance: 'dark', scale: neutralScale });
  }

  const colorPalettes = generateCustomColorPalettes({ appearance: 'dark' });

  return {
    ...mapToken!,
    ...colorPalettes,
    ...darkBaseToken,
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
