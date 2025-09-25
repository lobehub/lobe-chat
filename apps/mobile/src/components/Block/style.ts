import { createStyles } from '@/theme';

export const useStyles = createStyles(({ token, stylish }) => ({
  // 使用 stylish 预定义的变体样式
  borderless: stylish.variantBorderlessWithoutHover,
  clickableBorderless: stylish.variantBorderless,
  clickableFilled: stylish.variantFilled,
  clickableOutlined: stylish.variantOutlined,

  // 可点击状态基础样式
  clickableRoot: {
    // React Native 没有 cursor，但可以设置交互状态
  },

  filled: stylish.variantFilledWithoutHover,
  glass: stylish.blur,
  outlined: stylish.variantOutlinedWithoutHover,

  // 基础容器样式
  root: {
    borderRadius: token.borderRadius,
    position: 'relative' as const,
  },

  // 阴影效果
  shadow: stylish.shadow,
}));
