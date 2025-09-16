import { camelCase, capitalize } from 'lodash-es';
import type { AliasToken } from '../../interface';
import type { ThemeAppearance } from '../../ThemeProvider/types';
import { ColorScaleItem, colorScales } from '../../color';

export const generateColorPalette = ({
  type,
  scale,
  appearance,
}: {
  appearance: 'light' | 'dark';
  scale: ColorScaleItem;
  type: 'Primary' | 'Success' | 'Warning' | 'Error' | 'Info' | string;
}): Partial<AliasToken> => {
  const name = capitalize(type);
  const isDarkMode = appearance === 'dark';
  return {
    [`color${name}Fill`]: scale[`${appearance}A`][isDarkMode ? 3 : 4],
    [`color${name}FillSecondary`]: scale[`${appearance}A`][isDarkMode ? 2 : 3],
    [`color${name}FillTertiary`]: scale[`${appearance}A`][isDarkMode ? 1 : 2],
    [`color${name}FillQuaternary`]: scale[`${appearance}A`][isDarkMode ? 0 : 1],
    [`color${name}Bg`]: scale[appearance][1],
    [`color${name}Border`]: scale[appearance][4],
    [`color${name}`]: scale[appearance][9],
    [`color${name}Active`]: scale[appearance][isDarkMode ? 7 : 10],
    [`color${name}Text`]: scale[appearance][9],
    [`color${name}TextActive`]: scale[appearance][isDarkMode ? 7 : 10],
  };
};

export const generateColorNeutralPalette = ({
  scale,
  appearance,
}: {
  appearance: 'light' | 'dark';
  scale: ColorScaleItem;
}): Partial<AliasToken> => {
  return {
    colorBgContainer: appearance === 'dark' ? scale[appearance][1] : scale[appearance][0],
    colorBgElevated: appearance === 'dark' ? scale[appearance][2] : scale[appearance][0],
    colorBgLayout: appearance === 'dark' ? scale[appearance][0] : scale[appearance][1],
    colorBgMask: scale.lightA[8],
    colorBgSolid: scale[appearance][12],
    colorBgSpotlight: scale[appearance][4],
    colorBorder: scale[appearance][3],
    colorBorderSecondary: scale[appearance][2],
    colorFill: scale[`${appearance}A`][3],
    colorFillQuaternary: scale[`${appearance}A`][0],
    colorFillSecondary: scale[`${appearance}A`][2],
    colorFillTertiary: scale[`${appearance}A`][1],
    colorText: scale[appearance][12],
    colorTextQuaternary: scale[appearance][6],
    colorTextSecondary: scale[appearance][10],
    colorTextTertiary: scale[appearance][8],
  };
};
/**
 * 生成自定义颜色调色板（支持动态颜色）
 */
export const generateCustomColorPalette = ({
  name,
  scale,
  appearance,
}: {
  appearance: ThemeAppearance;
  name: string;
  scale: ColorScaleItem;
}): Partial<AliasToken> => {
  const colorStepPalette: { [key: string]: string } = {};

  // 生成数字色阶 (1-11)
  for (const [index, color] of scale[appearance].entries()) {
    colorStepPalette[`${name}${index + 1}`] = color;
  }

  // 生成Alpha色阶 (1A-11A)
  for (const [index, color] of scale[`${appearance}A`].entries()) {
    colorStepPalette[`${name}${index + 1}A`] = color;
  }

  return colorStepPalette;
};

export const generateCustomColorPalettes = ({ appearance }: { appearance: ThemeAppearance }) => {
  let colorCustomToken: any = {};

  for (const [type, scale] of Object.entries(colorScales)) {
    colorCustomToken = {
      ...colorCustomToken,
      ...generateCustomColorPalette({
        appearance,
        name: camelCase(type),
        scale,
      }),
    };
  }

  return colorCustomToken;
};
