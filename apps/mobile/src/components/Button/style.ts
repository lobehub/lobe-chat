import { readableColor } from 'polished';

import { createStyles } from '@/components/styles';

import type { ButtonSize } from './type';
import { calcSize } from './utils';

export const useStyles = createStyles(({ token, stylish }, props?: { size?: ButtonSize }) => {
  const size = props?.size || 'middle';
  const sizeStyles = calcSize(size, token);

  return {
    // Block style (full width)
    block: {
      alignSelf: 'stretch' as const,
      width: '100%' as const,
    },

    // Circle shape
    circle: {
      borderRadius: sizeStyles.height * 2,
      height: sizeStyles.height * 1.25,
      maxHeight: sizeStyles.height * 2,
      maxWidth: sizeStyles.height * 1.25,
      minHeight: sizeStyles.height * 1.25,
      minWidth: sizeStyles.height * 1.25,
      paddingBlock: 0,
      paddingInline: 0,
      width: sizeStyles.height * 1.25,
    },

    dangerBorderless: stylish.variantBorderlessDanger,

    dangerBorderlessHover: stylish.variantBorderlessDangerHover,

    dangerFilled: stylish.variantFilledDanger,

    dangerFilledHover: stylish.variantFilledDangerHover,

    dangerOutlined: stylish.variantOutlinedDanger,

    dangerOutlinedHover: stylish.variantOutlinedDangerHover,

    dangerPrimary: {
      backgroundColor: token.colorError,
    },

    dangerPrimaryHover: {
      backgroundColor: token.colorErrorActive,
    },

    diabled: stylish.disabled,

    // Loading state
    loading: {
      opacity: token.opacityLoading,
    },

    primary: {
      backgroundColor: token.colorPrimary,
    },

    primaryHover: {
      backgroundColor: token.colorPrimaryActive,
    },

    // Root styles
    root: {
      borderRadius: sizeStyles.height / 2.5,

      height: sizeStyles.height * 1.25,
      minWidth: sizeStyles.height * 1.25,

      paddingInline: sizeStyles.paddingInline * 1.25,

      position: 'relative' as const,
    },
    // Text styles
    textColor: {
      color: token.colorText,
      fontSize: sizeStyles.fontSize,
    },
    textColorDanger: {
      color: token.colorErrorText,
      fontSize: sizeStyles.fontSize,
    },
    textColorDangerFilled: {
      color: token.colorErrorText,
      fontSize: sizeStyles.fontSize,
    },
    textColorDangerPrimary: {
      color: readableColor(token.colorError),
      fontSize: sizeStyles.fontSize,
    },
    textColorDisabled: {
      color: token.colorTextDisabled,
      fontSize: sizeStyles.fontSize,
    },
    textColorPrimary: {
      color: readableColor(token.colorPrimary),
      fontSize: sizeStyles.fontSize,
    },
  };
});
