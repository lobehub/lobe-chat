/**
 * 应用字体常量定义
 * 定义了所有可用的自定义字体
 */

// 字体族名称常量
export const FONT_FAMILIES = {
  HACK: 'Hack',
  HARMONY_OS: 'HarmonyOS-Sans-SC',
} as const;

// 字体权重映射（对应不同的字体文件）
export const FONT_WEIGHTS = {
  BOLD: '700',
  MEDIUM: '500',
  NORMAL: '400',
} as const;

// 字体样式
export const FONT_STYLES = {
  ITALIC: 'italic',
  NORMAL: 'normal',
} as const;

// 字体映射类型
export type FontFamilyType = (typeof FONT_FAMILIES)[keyof typeof FONT_FAMILIES];
export type FontWeightType = (typeof FONT_WEIGHTS)[keyof typeof FONT_WEIGHTS];
export type FontStyleType = (typeof FONT_STYLES)[keyof typeof FONT_STYLES];

// 获取代码字体（返回字体族名称）
export const getCodeFont = (): FontFamilyType => {
  return FONT_FAMILIES.HACK;
};

// 获取中文字体（返回字体族名称）
export const getChineseFont = (): FontFamilyType => {
  return FONT_FAMILIES.HARMONY_OS;
};

// 获取字体样式配置对象
export const getCodeFontStyle = (
  weight: 'normal' | 'bold' = 'normal',
  style: 'normal' | 'italic' = 'normal',
) => {
  return {
    fontFamily: FONT_FAMILIES.HACK,
    fontStyle: style === 'italic' ? FONT_STYLES.ITALIC : FONT_STYLES.NORMAL,
    fontWeight: weight === 'bold' ? FONT_WEIGHTS.BOLD : FONT_WEIGHTS.NORMAL,
  };
};

// 获取中文字体样式配置对象
export const getChineseFontStyle = (weight: 'normal' | 'medium' | 'bold' = 'normal') => {
  let fontWeight: FontWeightType;
  switch (weight) {
    case 'medium': {
      fontWeight = FONT_WEIGHTS.MEDIUM;
      break;
    }
    case 'bold': {
      fontWeight = FONT_WEIGHTS.BOLD;
      break;
    }
    default: {
      fontWeight = FONT_WEIGHTS.NORMAL;
      break;
    }
  }

  return {
    fontFamily: FONT_FAMILIES.HARMONY_OS,
    fontWeight,
  };
};
