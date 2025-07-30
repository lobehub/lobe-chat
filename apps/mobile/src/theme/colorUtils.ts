import type { AliasToken } from '@/types/theme';

/**
 * Pure color and style utility functions
 * These functions have no React dependencies and can be safely imported anywhere
 */

// 获取行高
export function getLineHeight(fontSize: number): number {
  return (fontSize + 8) / fontSize;
}

/**
 * 颜色工具类
 * 参考 Ant Design 的颜色算法
 */

// 颜色解析函数
export function parseColor(color: string): { a: number; b: number; g: number; r: number } {
  // 处理 rgba 格式
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbaMatch) {
    return {
      a: rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1,
      b: parseInt(rgbaMatch[3], 10),
      g: parseInt(rgbaMatch[2], 10),
      r: parseInt(rgbaMatch[1], 10),
    };
  }

  // 处理 hex 格式
  const hexMatch = color.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3) {
      return {
        a: 1,
        b: parseInt(hex[2] + hex[2], 16),
        g: parseInt(hex[1] + hex[1], 16),
        r: parseInt(hex[0] + hex[0], 16),
      };
    } else {
      return {
        a: 1,
        b: parseInt(hex.slice(4, 6), 16),
        g: parseInt(hex.slice(2, 4), 16),
        r: parseInt(hex.slice(0, 2), 16),
      };
    }
  }

  // 默认返回透明色
  return { a: 0, b: 0, g: 0, r: 0 };
}

// 颜色转换为 rgba 字符串
export function toRgbaString(r: number, g: number, b: number, a: number = 1): string {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
}

const toHex = (n: number) => {
  const hex = Math.round(n).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
};

// 颜色转换为 hex 字符串
export function toHexString(r: number, g: number, b: number): string {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// 设置颜色透明度
export function setAlpha(color: string, alpha: number): string {
  const { r, g, b } = parseColor(color);
  return toRgbaString(r, g, b, alpha);
}

// 获取带透明度的颜色
export function getAlphaColor(baseColor: string, alpha: number): string {
  const { r, g, b } = parseColor(baseColor);
  return toRgbaString(r, g, b, alpha);
}

// 颜色亮度调整
export function adjustBrightness(color: string, amount: number): string {
  const { r, g, b, a } = parseColor(color);

  const adjust = (value: number) => {
    return Math.max(0, Math.min(255, value + amount * 255));
  };

  return toRgbaString(adjust(r), adjust(g), adjust(b), a);
}

// 颜色混合
export function mixColor(color1: string, color2: string, weight: number = 0.5): string {
  const c1 = parseColor(color1);
  const c2 = parseColor(color2);

  const mix = (v1: number, v2: number) => v1 * (1 - weight) + v2 * weight;

  return toRgbaString(mix(c1.r, c2.r), mix(c1.g, c2.g), mix(c1.b, c2.b), mix(c1.a, c2.a));
}

// 生成颜色梯度
export function generateColorPalette(
  baseColor: string,
  isDark: boolean = false,
): {
  1: string;
  10: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
} {
  const { r, g, b } = parseColor(baseColor);

  if (isDark) {
    // 暗色模式下的颜色梯度
    return {
      1: toRgbaString(r * 0.1, g * 0.1, b * 0.1, 1),
      10: toRgbaString(Math.min(255, r * 1.7), Math.min(255, g * 1.7), Math.min(255, b * 1.7), 1),
      2: toRgbaString(r * 0.2, g * 0.2, b * 0.2, 1),
      3: toRgbaString(r * 0.35, g * 0.35, b * 0.35, 1),
      4: toRgbaString(r * 0.5, g * 0.5, b * 0.5, 1),
      5: toRgbaString(r * 0.7, g * 0.7, b * 0.7, 1),
      6: baseColor,
      7: toRgbaString(Math.min(255, r * 1.15), Math.min(255, g * 1.15), Math.min(255, b * 1.15), 1),
      8: toRgbaString(Math.min(255, r * 1.3), Math.min(255, g * 1.3), Math.min(255, b * 1.3), 1),
      9: toRgbaString(Math.min(255, r * 1.5), Math.min(255, g * 1.5), Math.min(255, b * 1.5), 1),
    };
  } else {
    // 亮色模式下的颜色梯度
    return {
      1: toRgbaString(255 - (255 - r) * 0.1, 255 - (255 - g) * 0.1, 255 - (255 - b) * 0.1, 1),
      10: toRgbaString(r * 0.4, g * 0.4, b * 0.4, 1),
      2: toRgbaString(255 - (255 - r) * 0.2, 255 - (255 - g) * 0.2, 255 - (255 - b) * 0.2, 1),
      3: toRgbaString(255 - (255 - r) * 0.35, 255 - (255 - g) * 0.35, 255 - (255 - b) * 0.35, 1),
      4: toRgbaString(255 - (255 - r) * 0.5, 255 - (255 - g) * 0.5, 255 - (255 - b) * 0.5, 1),
      5: toRgbaString(255 - (255 - r) * 0.7, 255 - (255 - g) * 0.7, 255 - (255 - b) * 0.7, 1),
      6: baseColor,
      7: toRgbaString(r * 0.85, g * 0.85, b * 0.85, 1),
      8: toRgbaString(r * 0.7, g * 0.7, b * 0.7, 1),
      9: toRgbaString(r * 0.55, g * 0.55, b * 0.55, 1),
    };
  }
}

// 生成中性色梯度
export function generateNeutralColorPalette(
  bgBaseColor: string,
  textBaseColor: string,
  isDark: boolean = false,
): {
  colorBgBase: string;
  colorBgContainer: string;
  colorBgElevated: string;
  colorBgLayout: string;
  colorBgSolid: string;
  colorBgSolidActive: string;
  colorBgSolidHover: string;
  colorBgSpotlight: string;
  colorBorder: string;
  colorBorderSecondary: string;
  colorFill: string;
  colorFillQuaternary: string;
  colorFillSecondary: string;
  colorFillTertiary: string;
  colorText: string;
  colorTextBase: string;
  colorTextQuaternary: string;
  colorTextSecondary: string;
  colorTextTertiary: string;
} {
  const colorBgBase = bgBaseColor || (isDark ? '#000000' : '#ffffff');
  const colorTextBase = textBaseColor || (isDark ? '#ffffff' : '#000000');

  if (isDark) {
    // 暗色模式
    return {
      colorBgBase,
      colorBgContainer: adjustBrightness(colorBgBase, 0.08),
      colorBgElevated: adjustBrightness(colorBgBase, 0.12),
      colorBgLayout: adjustBrightness(colorBgBase, 0),
      // 实心背景色 - 暗色模式下使用较高的透明度
      colorBgSolid: getAlphaColor(colorTextBase, 0.95),

      colorBgSolidActive: getAlphaColor(colorTextBase, 0.9),

      colorBgSolidHover: getAlphaColor(colorTextBase, 1),

      colorBgSpotlight: adjustBrightness(colorBgBase, 0.26),

      colorBorder: adjustBrightness(colorBgBase, 0.26),

      colorBorderSecondary: adjustBrightness(colorBgBase, 0.19),

      colorFill: getAlphaColor(colorTextBase, 0.18),

      colorFillQuaternary: getAlphaColor(colorTextBase, 0.04),

      colorFillSecondary: getAlphaColor(colorTextBase, 0.12),

      colorFillTertiary: getAlphaColor(colorTextBase, 0.08),

      colorText: getAlphaColor(colorTextBase, 0.85),
      colorTextBase,
      colorTextQuaternary: getAlphaColor(colorTextBase, 0.25),

      colorTextSecondary: getAlphaColor(colorTextBase, 0.65),
      colorTextTertiary: getAlphaColor(colorTextBase, 0.45),
    };
  } else {
    // 亮色模式
    return {
      colorBgBase,
      colorBgContainer: adjustBrightness(colorBgBase, 0),
      colorBgElevated: adjustBrightness(colorBgBase, 0),
      colorBgLayout: adjustBrightness(colorBgBase, -0.04),
      // 实心背景色 - 亮色模式下使用较高的透明度
      colorBgSolid: getAlphaColor(colorTextBase, 1),

      colorBgSolidActive: getAlphaColor(colorTextBase, 0.95),

      colorBgSolidHover: getAlphaColor(colorTextBase, 0.75),

      colorBgSpotlight: getAlphaColor(colorTextBase, 0.85),

      colorBorder: adjustBrightness(colorBgBase, -0.15),

      colorBorderSecondary: adjustBrightness(colorBgBase, -0.06),

      colorFill: getAlphaColor(colorTextBase, 0.15),

      colorFillQuaternary: getAlphaColor(colorTextBase, 0.02),

      colorFillSecondary: getAlphaColor(colorTextBase, 0.06),

      colorFillTertiary: getAlphaColor(colorTextBase, 0.04),

      colorText: getAlphaColor(colorTextBase, 0.88),
      colorTextBase,
      colorTextQuaternary: getAlphaColor(colorTextBase, 0.25),

      colorTextSecondary: getAlphaColor(colorTextBase, 0.65),
      colorTextTertiary: getAlphaColor(colorTextBase, 0.45),
    };
  }
}

// 获取字体大小梯度
export function getFontSizes(base: number): { lineHeight: number; size: number }[] {
  const fontSizes = Array.from({ length: 10 }).map((_, index) => {
    const i = index - 1;
    const baseSize = base * Math.E ** (i / 5);
    const intSize = index > 1 ? Math.floor(baseSize) : Math.ceil(baseSize);

    // Convert to even
    return Math.floor(intSize / 2) * 2;
  });

  fontSizes[1] = base;

  return fontSizes.map((size) => ({
    lineHeight: getLineHeight(size),
    size,
  }));
}

// 生成圆角梯度
export function generateRadius(radiusBase: number): {
  borderRadius: number;
  borderRadiusLG: number;
  borderRadiusOuter: number;
  borderRadiusSM: number;
  borderRadiusXS: number;
} {
  let radiusLG = radiusBase;
  let radiusSM = radiusBase;
  let radiusXS = radiusBase;
  let radiusOuter = radiusBase;

  // radiusLG
  if (radiusBase < 6 && radiusBase >= 5) {
    radiusLG = radiusBase + 1;
  } else if (radiusBase < 16 && radiusBase >= 6) {
    radiusLG = radiusBase + 2;
  } else if (radiusBase >= 16) {
    radiusLG = 16;
  }

  // radiusSM
  if (radiusBase < 7 && radiusBase >= 5) {
    radiusSM = 4;
  } else if (radiusBase < 8 && radiusBase >= 7) {
    radiusSM = 5;
  } else if (radiusBase < 14 && radiusBase >= 8) {
    radiusSM = 6;
  } else if (radiusBase < 16 && radiusBase >= 14) {
    radiusSM = 7;
  } else if (radiusBase >= 16) {
    radiusSM = 8;
  }

  // radiusXS
  if (radiusBase < 6 && radiusBase >= 2) {
    radiusXS = 1;
  } else if (radiusBase >= 6) {
    radiusXS = 2;
  }

  // radiusOuter
  if (radiusBase > 4 && radiusBase < 8) {
    radiusOuter = 4;
  } else if (radiusBase >= 8) {
    radiusOuter = 6;
  }

  return {
    borderRadius: radiusBase,
    borderRadiusLG: radiusLG,
    borderRadiusOuter: radiusOuter,
    borderRadiusSM: radiusSM,
    borderRadiusXS: radiusXS,
  };
}

// 创建样式对象的工具函数
export const createThemedStyle = (token: AliasToken) => {
  return {
    button: {
      primary: {
        backgroundColor: token.colorPrimary,
        borderRadius: token.borderRadius,
        paddingHorizontal: token.padding,
        paddingVertical: token.paddingSM,
      },
      secondary: {
        backgroundColor: token.colorBgContainer,
        borderColor: token.colorBorder,
        borderRadius: token.borderRadius,
        borderWidth: 1,
        paddingHorizontal: token.padding,
        paddingVertical: token.paddingSM,
      },
    },

    // 常用样式组合
    card: {
      backgroundColor: token.colorBgContainer,
      borderColor: token.colorBorder,
      borderRadius: token.borderRadius,
      borderWidth: 1,
      padding: token.padding,
    },

    elevated: {
      backgroundColor: token.colorBgElevated,
      borderRadius: token.borderRadius,
      elevation: 3,
      padding: token.padding,
      shadowColor: token.colorText,
      shadowOffset: { height: 2, width: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },

    text: {
      body: {
        color: token.colorText,
        fontSize: token.fontSize,
        lineHeight: token.fontSize * token.lineHeight,
      },
      caption: {
        color: token.colorTextSecondary,
        fontSize: token.fontSizeSM,
        lineHeight: token.fontSizeSM * token.lineHeightSM,
      },
      heading: {
        color: token.colorTextHeading,
        fontSize: token.fontSizeHeading4,
        fontWeight: token.fontWeightStrong,
        lineHeight: token.fontSizeHeading4 * token.lineHeightLG,
      },
    },
  };
};
