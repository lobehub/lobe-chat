import { createStyles } from '@/theme';
import type { PresetColorKey } from '@/theme/interface';

export type ButtonType = 'primary' | 'default' | 'text' | 'link' | 'dashed';
export type ButtonVariant = 'tlined' | 'dashed' | 'solid' | 'filled' | 'text' | 'link';
export type ButtonColor = 'default' | 'primary' | 'danger' | PresetColorKey;
export type ButtonSize = 'small' | 'middle' | 'large';
export type ButtonShape = 'default' | 'circle';

export const useStyles = createStyles(
  (
    token,
    {
      variant,
      color,
      size,
      disabled,
      block,
      shape,
    }: {
      block: boolean;
      color: ButtonColor;
      disabled: boolean;
      shape: ButtonShape;
      size: ButtonSize;
      variant: ButtonVariant;
    },
  ) => {
    // Resolve a base color from `color` prop (including PresetColorKey)
    const resolveBaseColor = () => {
      if (color === 'primary') return token.colorPrimary;
      // If both `danger` and `color` are provided, respect `color`
      if (color === 'danger') return token.colorError;
      if (color && color !== 'default') {
        const key10 = `${color}10` as keyof typeof token;
        // prefer 10 shade if available, otherwise fallback to primary
        return (token as any)[key10] || token.colorPrimary;
      }
      // default neutral text color as accent for outlines/text
      return token.colorText;
    };

    const baseColor = resolveBaseColor();

    const getVariantStyles = () => {
      switch (variant) {
        case 'filled': {
          return {
            backgroundColor: disabled ? token.colorBgContainerDisabled : baseColor,
            borderColor: disabled ? token.colorBorder : baseColor,
            borderStyle: 'solid' as const,
            borderWidth: 1,
            textColor: disabled ? token.colorTextDisabled : token.colorTextLightSolid,
          };
        }
        case 'solid': {
          return {
            backgroundColor: disabled ? token.colorBgContainerDisabled : token.colorBgContainer,
            borderColor: disabled || color === 'default' ? token.colorBorder : baseColor,
            borderStyle: 'solid' as const,
            borderWidth: 1,
            textColor: disabled
              ? token.colorTextDisabled
              : color === 'default'
                ? token.colorText
                : baseColor,
          };
        }
        case 'tlined': {
          return {
            backgroundColor: 'transparent',
            borderColor: disabled ? token.colorBorder : baseColor,
            borderStyle: 'solid' as const,
            borderWidth: 1,
            textColor: disabled ? token.colorTextDisabled : baseColor,
          };
        }
        case 'dashed': {
          return {
            backgroundColor: disabled ? token.colorBgContainerDisabled : token.colorBgContainer,
            borderColor: token.colorBorder,
            borderStyle: 'dashed' as const,
            borderWidth: 1,
            textColor: disabled
              ? token.colorTextDisabled
              : color === 'default'
                ? token.colorText
                : baseColor,
          };
        }
        case 'text': {
          return {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            borderStyle: 'solid' as const,
            borderWidth: 0,
            textColor: disabled ? token.colorTextDisabled : baseColor,
          };
        }
        case 'link': {
          return {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            borderStyle: 'solid' as const,
            borderWidth: 0,
            textColor: disabled ? token.colorTextDisabled : baseColor,
          };
        }
        default: {
          return {
            backgroundColor: disabled ? token.colorBgContainerDisabled : token.colorBgContainer,
            borderColor: disabled ? token.colorBorder : token.colorBorder,
            borderStyle: 'solid' as const,
            borderWidth: 1,
            textColor: disabled ? token.colorTextDisabled : token.colorText,
          };
        }
      }
    };

    const getSizeStyles = () => {
      switch (size) {
        case 'small': {
          return {
            fontSize: token.fontSizeSM,
            height: token.controlHeightSM,
            paddingHorizontal: token.paddingContentHorizontalSM,
            paddingVertical: token.paddingContentVerticalSM,
          };
        }
        case 'large': {
          return {
            fontSize: token.fontSizeLG,
            height: token.controlHeightLG,
            paddingHorizontal: token.paddingContentHorizontalLG,
            paddingVertical: token.paddingContentVerticalLG,
          };
        }
        default: {
          return {
            fontSize: token.fontSize,
            height: token.controlHeight,
            paddingHorizontal: token.paddingContentHorizontal,
            paddingVertical: token.paddingContentVertical,
          };
        }
      }
    };

    const typeStyles = getVariantStyles();
    const sizeStyles = getSizeStyles();

    const isCircle = shape === 'circle';

    return {
      button: {
        alignItems: 'center',
        backgroundColor: typeStyles.backgroundColor,
        borderColor: typeStyles.borderColor,
        borderRadius: isCircle ? sizeStyles.height / 2 : token.borderRadius,
        borderStyle: typeStyles.borderStyle,
        borderWidth: typeStyles.borderWidth,
        flexDirection: 'row',
        height: isCircle ? sizeStyles.height : undefined,
        justifyContent: 'center',
        minHeight: isCircle ? undefined : sizeStyles.height,
        opacity: disabled ? 0.6 : 1,
        paddingHorizontal: isCircle ? 0 : sizeStyles.paddingHorizontal,
        paddingVertical: isCircle ? 0 : sizeStyles.paddingVertical,
        width: isCircle ? sizeStyles.height : block ? '100%' : 'auto',
      },
      loading: {
        marginRight: isCircle ? 0 : token.marginXS,
      },
      text: {
        color: typeStyles.textColor,
        fontSize: sizeStyles.fontSize,
        textAlign: 'center',
        textDecorationLine: variant === 'link' ? 'underline' : 'none',
      },
    };
  },
);
