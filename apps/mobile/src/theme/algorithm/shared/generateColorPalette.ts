import { camelCase, capitalize } from 'lodash-es';
import { mix } from 'polished';
import type { AliasToken } from '../../interface';
import type { ThemeAppearance } from '../../ThemeProvider/types';
import { ColorScaleItem, colorScales } from '../../color';

/**
 * 生成颜色调色板
 * 基于LobeUI的颜色生成算法
 */
export const generateColorPalette = ({
  type,
  scale,
  appearance,
}: {
  appearance: ThemeAppearance;
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
    [`color${name}BgHover`]: scale[appearance][2],
    [`color${name}Border`]: scale[appearance][4],
    [`color${name}BorderHover`]: scale[appearance][isDarkMode ? 5 : 3],
    [`color${name}Hover`]: scale[appearance][isDarkMode ? 10 : 8],
    [`color${name}`]: scale[appearance][9],
    [`color${name}Active`]: scale[appearance][isDarkMode ? 7 : 10],
    [`color${name}TextHover`]: scale[appearance][isDarkMode ? 10 : 8],
    [`color${name}Text`]: scale[appearance][9],
    [`color${name}TextActive`]: scale[appearance][isDarkMode ? 7 : 10],
  };
};

/**
 * 生成中性色调色板
 */
export const generateColorNeutralPalette = ({
  scale,
  appearance,
}: {
  appearance: ThemeAppearance;
  scale: ColorScaleItem;
}): Partial<AliasToken> => {
  const colorBgLayout = appearance === 'dark' ? scale[appearance][0] : scale[appearance][1];
  const colorBgContainer = appearance === 'dark' ? scale[appearance][1] : scale[appearance][0];
  const colorBgElevated = appearance === 'dark' ? scale[appearance][2] : scale[appearance][0];

  return {
    colorBgContainer,
    colorBgContainerSecondary: mix(0.5, colorBgLayout, colorBgContainer),
    colorBgElevated,
    colorBgLayout,

    colorBgMask: scale.lightA[8],
    colorBgSpotlight: scale[appearance][4],

    colorBorder: scale[appearance][6],
    colorBorderSecondary: scale[appearance][3],

    colorFill: scale[`${appearance}A`][4],
    colorFillQuaternary: scale[`${appearance}A`][1],
    colorFillSecondary: scale[`${appearance}A`][3],
    colorFillTertiary: scale[`${appearance}A`][2],

    colorText: scale[appearance][12],
    colorTextBase: scale[appearance][12],
    colorTextQuaternary: scale[appearance][8],
    colorTextSecondary: scale[appearance][11],
    colorTextTertiary: scale[appearance][9],
    colorWhite: '#fff',
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
