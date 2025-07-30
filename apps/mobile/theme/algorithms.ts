import type { MapToken, MappingAlgorithm, SeedToken } from '@/mobile/types/theme';

import {
  generateColorPalette,
  generateNeutralColorPalette,
  generateRadius,
  getAlphaColor,
  getFontSizes,
} from './colorUtils';

/**
 * 生成颜色映射 Token
 */
function generateColorMapToken(seed: SeedToken, isDark: boolean): any {
  const {
    colorPrimary,
    colorSuccess,
    colorWarning,
    colorError,
    colorInfo,
    colorBgBase,
    colorTextBase,
  } = seed;

  // 生成品牌色梯度
  const primaryColors = generateColorPalette(colorPrimary, isDark);
  const successColors = generateColorPalette(colorSuccess, isDark);
  const warningColors = generateColorPalette(colorWarning, isDark);
  const errorColors = generateColorPalette(colorError, isDark);
  const infoColors = generateColorPalette(colorInfo, isDark);

  // 生成中性色
  const neutralColors = generateNeutralColorPalette(
    colorBgBase || (isDark ? '#000000' : '#ffffff'),
    colorTextBase || (isDark ? '#ffffff' : '#000000'),
    isDark,
  );

  return {
    ...neutralColors,

    // 背景遮罩色
    colorBgMask: isDark ? getAlphaColor('#000000', 0.45) : getAlphaColor('#000000', 0.25),

    // 错误色梯度
    colorError: errorColors[6],

    colorErrorActive: errorColors[7],

    colorErrorBg: errorColors[1],

    colorErrorBgHover: errorColors[2],

    colorErrorBorder: errorColors[3],

    colorErrorBorderHover: errorColors[4],

    colorErrorHover: errorColors[5],

    colorErrorText: errorColors[9],

    colorErrorTextActive: errorColors[10],

    colorErrorTextHover: errorColors[8],

    // 信息色梯度
    colorInfo: infoColors[6],

    colorInfoActive: infoColors[7],

    colorInfoBg: infoColors[1],

    colorInfoBgHover: infoColors[2],

    colorInfoBorder: infoColors[3],

    colorInfoBorderHover: infoColors[4],

    colorInfoHover: infoColors[5],

    colorInfoText: infoColors[9],

    colorInfoTextActive: infoColors[10],

    colorInfoTextHover: infoColors[8],

    // 链接色梯度
    colorLink: infoColors[6],
    colorLinkActive: infoColors[7],
    colorLinkHover: infoColors[5],

    // 品牌色梯度
    colorPrimary: primaryColors[6],

    colorPrimaryActive: primaryColors[7],

    colorPrimaryBg: primaryColors[1],

    colorPrimaryBgHover: primaryColors[2],

    colorPrimaryBorder: primaryColors[3],

    colorPrimaryBorderHover: primaryColors[4],

    colorPrimaryHover: primaryColors[5],

    colorPrimaryText: primaryColors[9],

    colorPrimaryTextActive: primaryColors[10],

    colorPrimaryTextHover: primaryColors[8],

    // 成功色梯度
    colorSuccess: successColors[6],

    colorSuccessActive: successColors[7],

    colorSuccessBg: successColors[1],

    colorSuccessBgHover: successColors[2],

    colorSuccessBorder: successColors[3],

    colorSuccessBorderHover: successColors[4],

    colorSuccessHover: successColors[5],

    colorSuccessText: successColors[9],

    colorSuccessTextActive: successColors[10],

    colorSuccessTextHover: successColors[8],

    // 警告色梯度
    colorWarning: warningColors[6],

    colorWarningActive: warningColors[7],

    colorWarningBg: warningColors[1],

    colorWarningBgHover: warningColors[2],

    colorWarningBorder: warningColors[3],

    colorWarningBorderHover: warningColors[4],

    colorWarningHover: warningColors[5],

    colorWarningText: warningColors[9],

    colorWarningTextActive: warningColors[10],

    colorWarningTextHover: warningColors[8],

    // 纯色
    colorWhite: '#ffffff',
  };
}

/**
 * 生成尺寸映射 Token
 */
function generateSizeMapToken(seed: SeedToken): any {
  const { sizeUnit, sizeStep } = seed;

  return {
    // 16
    size: sizeUnit * sizeStep,

    // 32
    sizeLG: sizeUnit * (sizeStep + 2),

    // 24
    sizeMD: sizeUnit * (sizeStep + 1),

    // 20
    sizeMS: sizeUnit * sizeStep,

    // 16
    sizeSM: sizeUnit * (sizeStep - 1),

    // 48
    sizeXL: sizeUnit * (sizeStep + 4),
    // 12
    sizeXS: sizeUnit * (sizeStep - 2),
    sizeXXL: sizeUnit * (sizeStep + 8), // 8
    sizeXXS: sizeUnit * (sizeStep - 3), // 4
  };
}

/**
 * 生成高度映射 Token
 */
function generateHeightMapToken(seed: SeedToken): any {
  const { controlHeight } = seed;

  return {
    // 24
    controlHeightLG: controlHeight * 1.25,

    // 16
    controlHeightSM: controlHeight * 0.75,
    controlHeightXS: controlHeight * 0.5, // 40
  };
}

/**
 * 生成字体映射 Token
 */
function generateFontMapToken(seed: SeedToken): any {
  const { fontSize } = seed;
  const fontSizePairs = getFontSizes(fontSize);
  const fontSizes = fontSizePairs.map((pair) => pair.size);
  const lineHeights = fontSizePairs.map((pair) => pair.lineHeight);

  const fontSizeMD = fontSizes[1];
  const fontSizeSM = fontSizes[0];
  const fontSizeLG = fontSizes[2];
  const lineHeight = lineHeights[1];
  const lineHeightSM = lineHeights[0];
  const lineHeightLG = lineHeights[2];

  return {
    fontHeight: Math.round(lineHeight * fontSizeMD),
    fontHeightLG: Math.round(lineHeightLG * fontSizeLG),
    fontHeightSM: Math.round(lineHeightSM * fontSizeSM),
    fontSize: fontSizeMD,

    fontSizeHeading1: fontSizes[6],
    fontSizeHeading2: fontSizes[5],
    fontSizeHeading3: fontSizes[4],
    fontSizeHeading4: fontSizes[3],
    fontSizeHeading5: fontSizes[2],

    fontSizeLG,
    fontSizeSM,
    fontSizeXL: fontSizes[3],

    lineHeight,
    lineHeightHeading1: lineHeights[6],
    lineHeightHeading2: lineHeights[5],

    lineHeightHeading3: lineHeights[4],
    lineHeightHeading4: lineHeights[3],
    lineHeightHeading5: lineHeights[2],
    lineHeightLG,
    lineHeightSM,
  };
}

/**
 * 生成样式映射 Token
 */
function generateStyleMapToken(seed: SeedToken): any {
  const { lineWidth, borderRadius } = seed;
  const radiusTokens = generateRadius(borderRadius);

  return {
    lineWidthBold: lineWidth + 1,
    ...radiusTokens,
  };
}

/**
 * 生成通用映射 Token
 */
function generateCommonMapToken(seed: SeedToken): any {
  const { motionUnit, motionBase } = seed;

  return {
    motionDurationFast: `${(motionBase + motionUnit).toFixed(1)}s`,
    motionDurationMid: `${(motionBase + motionUnit * 2).toFixed(1)}s`,
    motionDurationSlow: `${(motionBase + motionUnit * 3).toFixed(1)}s`,
  };
}

/**
 * 默认算法 - 亮色模式
 */
export const defaultAlgorithm: MappingAlgorithm = (seed: SeedToken): MapToken => {
  const isDark = false;

  return {
    ...seed,
    ...generateColorMapToken(seed, isDark),
    ...generateSizeMapToken(seed),
    ...generateHeightMapToken(seed),
    ...generateFontMapToken(seed),
    ...generateStyleMapToken(seed),
    ...generateCommonMapToken(seed),
  } as MapToken;
};

/**
 * 暗色算法 - 暗色模式
 */
export const darkAlgorithm: MappingAlgorithm = (seed: SeedToken): MapToken => {
  const isDark = true;

  return {
    ...seed,
    ...generateColorMapToken(seed, isDark),
    ...generateSizeMapToken(seed),
    ...generateHeightMapToken(seed),
    ...generateFontMapToken(seed),
    ...generateStyleMapToken(seed),
    ...generateCommonMapToken(seed),
  } as MapToken;
};

/**
 * 紧凑算法 - 紧凑布局
 */
export const compactAlgorithm: MappingAlgorithm = (seed: SeedToken): MapToken => {
  const isDark = false;
  const compactSeed = {
    ...seed,
    controlHeight: seed.controlHeight - 4,
    fontSize: seed.fontSize - 2,
    sizeStep: seed.sizeStep - 2,
  };

  return {
    ...compactSeed,
    ...generateColorMapToken(compactSeed, isDark),
    ...generateSizeMapToken(compactSeed),
    ...generateHeightMapToken(compactSeed),
    ...generateFontMapToken(compactSeed),
    ...generateStyleMapToken(compactSeed),
    ...generateCommonMapToken(compactSeed),
  } as MapToken;
};

/**
 * 紧凑暗色算法 - 紧凑暗色模式
 */
export const compactDarkAlgorithm: MappingAlgorithm = (seed: SeedToken): MapToken => {
  const isDark = true;
  const compactSeed = {
    ...seed,
    controlHeight: seed.controlHeight - 4,
    fontSize: seed.fontSize - 2,
    sizeStep: seed.sizeStep - 2,
  };

  return {
    ...compactSeed,
    ...generateColorMapToken(compactSeed, isDark),
    ...generateSizeMapToken(compactSeed),
    ...generateHeightMapToken(compactSeed),
    ...generateFontMapToken(compactSeed),
    ...generateStyleMapToken(compactSeed),
    ...generateCommonMapToken(compactSeed),
  } as MapToken;
};
