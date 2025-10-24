import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  borderless: {
    borderWidth: 0,
  },

  // 基础容器样式
  container: {
    alignSelf: 'flex-start' as const,
    gap: token.marginXXS,
  },

  // 样式变体
  filled: {
    // 不使用 stylish 预设，保持空对象以便颜色样式能正确应用
  },

  large: {
    height: 28,
    paddingInline: token.paddingSM,
  },

  medium: {
    height: 22,
    paddingInline: token.paddingXS,
  },

  outlined: {
    borderWidth: 1,
  },

  // 尺寸变体
  small: {
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
