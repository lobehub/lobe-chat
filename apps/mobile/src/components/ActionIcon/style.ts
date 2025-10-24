import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token, stylish }) => {
  return {
    active: stylish.active,
    borderless: stylish.variantBorderless,
    dangerBorderless: stylish.variantBorderlessDanger,
    dangerBorderlessHover: stylish.variantBorderlessDangerHover,
    dangerFilled: stylish.variantFilledDanger,
    dangerFilledHover: stylish.variantFilledDangerHover,
    dangerOutlined: stylish.variantOutlinedDanger,
    dangerOutlinedHover: stylish.variantOutlinedDangerHover,
    disabled: stylish.disabled,
    filled: stylish.variantFilled,
    glass: stylish.blur,
    outlined: stylish.variantOutlined,
    root: {
      color: token.colorTextTertiary,
      cursor: 'pointer',
      overflow: 'hidden',
      pointerEvents: 'auto',
      position: 'relative',
    },

    //
    //
    // root2: css`
    //   cursor: pointer;
    //
    //   position: relative;
    //
    //   overflow: hidden;
    //
    //   color: ${token.colorTextTertiary};
    //
    //   transition:
    //     color 400ms ${token.motionEaseOut},
    //     background 100ms ${token.motionEaseOut};
    //
    //   &:hover {
    //     color: ${token.colorTextSecondary};
    //   }
    //
    //   &:active {
    //     color: ${isDarkMode ? token.colorTextTertiary : token.colorText};
    //   }
    // `,
    // shadow: stylish.shadow,
  };
});
