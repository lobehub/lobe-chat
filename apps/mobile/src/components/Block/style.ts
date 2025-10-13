import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token, stylish }) => ({
  borderless: stylish.variantBorderless,
  borderlessActive: stylish.variantBorderlessActive,
  borderlessHover: stylish.variantBorderlessHover,
  filled: stylish.variantFilled,

  filledActive: stylish.variantFilledActive,
  filledHover: stylish.variantFilledHover,
  glass: stylish.blur,

  outlined: stylish.variantOutlined,
  outlinedActive: stylish.variantOutlinedActive,
  outlinedHover: stylish.variantOutlinedHover,
  root: {
    borderRadius: token.borderRadius,
    position: 'relative' as const,
  },
  shadow: stylish.shadow,
}));
