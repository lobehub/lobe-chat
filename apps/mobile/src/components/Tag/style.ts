import { StyleSheet } from 'react-native';

import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  // borderless 变体：无边框，透明背景
  borderless: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },

  // 基础容器样式
  container: {
    alignSelf: 'flex-start' as const,
    borderRadius: token.borderRadiusSM,
    gap: token.marginXXS,
  },

  // filled 变体：填充背景，无边框
  filled: {
    backgroundColor: token.colorFillTertiary,
    borderWidth: 0,
  },

  large: {
    borderRadius: token.borderRadius,
    height: 28,
    paddingInline: token.paddingSM,
  },

  medium: {
    borderRadius: token.borderRadiusSM,
    height: 22,
    paddingInline: token.paddingXS,
  },

  // outlined 变体：透明背景，有边框
  outlined: {
    backgroundColor: 'transparent',
    borderColor: token.colorBorderSecondary,
    borderWidth: StyleSheet.hairlineWidth,
  },

  // 尺寸变体
  small: {
    borderRadius: token.borderRadiusSM,
    height: 20,
    paddingInline: token.paddingXXS,
  },

  // 文本样式 - 调整 lineHeight 以适配固定高度
  text: {
    fontSize: token.fontSizeSM,
    lineHeight: 20, // 固定行高以适配容器高度
  },

  textLarge: {
    fontSize: token.fontSize,
    lineHeight: 24, // large 尺寸的行高
  },

  textSmall: {
    fontSize: token.fontSizeSM - 1,
    lineHeight: 18, // small 尺寸的行高
  },
}));
