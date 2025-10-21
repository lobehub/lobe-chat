import { darken, lighten, readableColor } from 'polished';

import type { AliasToken } from '@/components/styles/theme';
import { colorScales } from '@/components/styles/theme/color';

// 预设颜色列表
export const presetColors = [
  'red',
  'volcano',
  'orange',
  'gold',
  'yellow',
  'lime',
  'green',
  'cyan',
  'blue',
  'geekblue',
  'purple',
  'magenta',
  'gray',
] as const;

// 系统状态颜色
export const presetSystemColors = new Set(['error', 'warning', 'success', 'info', 'processing']);

/**
 * 判断是否为 Hex 颜色值
 */
export const isHexColor = (color?: string): boolean => {
  return !!color && /^#([\da-f]{3}){1,2}$/i.test(color);
};

/**
 * 获取预设颜色的样式
 * 使用数字色阶：浅色背景（3）、中等色边框（7）、深色文字（11）
 */
export const getPresetColorStyles = (
  token: AliasToken,
  color: string,
  variant: 'filled' | 'outlined' | 'borderless',
  appearance: 'light' | 'dark',
) => {
  const isBorderless = variant === 'borderless';
  const scale = colorScales[color as keyof typeof colorScales];
  const isDarkMode = appearance === 'dark';

  if (!scale) {
    return {
      backgroundColor: token.colorFillTertiary,
      borderColor: token.colorBorderSecondary,
      color: token.colorTextSecondary,
    };
  }

  return {
    backgroundColor: isBorderless
      ? 'transparent'
      : isDarkMode
        ? scale[appearance][1]
        : scale[appearance][2],
    borderColor: isDarkMode ? scale[appearance][2] : scale[appearance][3],
    color: isDarkMode ? scale[appearance][9] : scale[appearance][10],
  };
};

/**
 * 获取系统状态颜色的样式
 */
export const getSystemColorStyles = (
  token: AliasToken,
  color: string,
  variant: 'filled' | 'outlined' | 'borderless',
) => {
  const isBorderless = variant === 'borderless';
  const isFilled = variant === 'filled';

  // processing 映射为 info
  const normalizedColor = color === 'processing' ? 'info' : color;

  const statusColorMap: Record<
    string,
    { backgroundColor: string; borderColor: string; color: string }
  > = {
    error: {
      backgroundColor: isBorderless ? 'transparent' : token.colorErrorBg,
      borderColor: isFilled ? token.colorErrorBg : token.colorErrorBorder,
      color: token.colorErrorText,
    },
    info: {
      backgroundColor: isBorderless ? 'transparent' : token.colorInfoBg,
      borderColor: isFilled ? token.colorInfoBorder : token.colorInfoBg,
      color: token.colorInfoText,
    },
    success: {
      backgroundColor: isBorderless ? 'transparent' : token.colorSuccessBg,
      borderColor: isFilled ? token.colorSuccessBg : token.colorSuccessBorder,
      color: token.colorSuccessText,
    },
    warning: {
      backgroundColor: isBorderless ? 'transparent' : token.colorWarningBg,
      borderColor: isFilled ? token.colorWarningBg : token.colorWarningBorder,
      color: token.colorWarningText,
    },
  };

  return (
    statusColorMap[normalizedColor] || {
      backgroundColor: token.colorFillTertiary,
      borderColor: token.colorBorderSecondary,
      color: token.colorTextSecondary,
    }
  );
};

/**
 * 获取标签的颜色样式
 */
export const getTagColorStyles = (
  token: AliasToken,
  appearance: 'light' | 'dark',
  color?: string,
  variant: 'filled' | 'outlined' | 'borderless' = 'filled',
) => {
  const isBorderless = variant === 'borderless';
  const isDarkMode = appearance === 'dark';

  // 没有颜色，返回默认样式
  if (!color) {
    return {
      backgroundColor: isBorderless ? 'transparent' : token.colorFillTertiary,
      borderColor: token.colorBorderSecondary,
      color: token.colorTextSecondary,
    };
  }

  // Hex 颜色值
  if (isHexColor(color)) {
    return {
      backgroundColor: isBorderless ? 'transparent' : color,
      borderColor: isDarkMode ? lighten(0.1, color) : darken(0.1, color),
      color: readableColor(color),
    };
  }

  // 系统状态颜色
  if (presetSystemColors.has(color)) {
    return getSystemColorStyles(token, color, variant);
  }

  // 预设颜色
  if (presetColors.includes(color as any)) {
    return getPresetColorStyles(token, color, variant, appearance);
  }

  // 默认样式
  return {
    backgroundColor: isBorderless ? 'transparent' : token.colorFillTertiary,
    borderColor: token.colorBorder,
    color: token.colorTextSecondary,
  };
};
