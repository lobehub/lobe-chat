import { createStyles, cva } from '@/theme';

import type { BlockVariantProps } from './type';

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

// CVA 变体定义
export const useBlockVariants = (styles: ReturnType<typeof useStyles>['styles']) =>
  cva<BlockVariantProps>(styles.root, {
    compoundVariants: [
      {
        clickable: true,
        style: styles.clickableBorderless,
        variant: 'borderless',
      },
      {
        clickable: true,
        style: styles.clickableFilled,
        variant: 'filled',
      },
      {
        clickable: true,
        style: styles.clickableOutlined,
        variant: 'outlined',
      },
    ],
    defaultVariants: {
      clickable: false,
      glass: false,
      shadow: false,
      variant: 'filled',
    },
    variants: {
      clickable: {
        false: null,
        true: styles.clickableRoot,
      },
      glass: {
        false: null,
        true: styles.glass,
      },
      shadow: {
        false: null,
        true: styles.shadow,
      },
      variant: {
        borderless: styles.borderless,
        filled: styles.filled,
        outlined: styles.outlined,
      },
    },
  });
