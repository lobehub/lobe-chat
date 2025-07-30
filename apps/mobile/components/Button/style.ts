import { createStyles } from '@/mobile/theme';

export type ButtonType = 'primary' | 'default' | 'text' | 'link';
export type ButtonSize = 'small' | 'middle' | 'large';

export const useStyles = createStyles(
  (
    token,
    {
      type,
      size,
      disabled,
      block,
    }: { block: boolean; disabled: boolean; size: ButtonSize; type: ButtonType },
  ) => {
    const getTypeStyles = () => {
      switch (type) {
        case 'primary': {
          return {
            backgroundColor: disabled ? token.colorPrimaryBg : token.colorTextBase,
            borderColor: disabled ? token.colorPrimaryBorder : token.colorTextBase,
            textColor: disabled ? token.colorTextDisabled : token.colorBgLayout,
          };
        }
        case 'text': {
          return {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            textColor: disabled ? token.colorTextDisabled : token.colorPrimary,
          };
        }
        case 'link': {
          return {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            textColor: disabled ? token.colorTextDisabled : token.colorPrimary,
          };
        }
        default: {
          return {
            backgroundColor: disabled ? token.colorBgContainerDisabled : token.colorBgContainer,
            borderColor: disabled ? token.colorBorder : token.colorBorder,
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
            minHeight: 24,
            paddingHorizontal: token.paddingXS,
            paddingVertical: token.paddingXXS,
          };
        }
        case 'large': {
          return {
            fontSize: token.fontSizeLG,
            minHeight: 40,
            paddingHorizontal: token.paddingLG,
            paddingVertical: token.paddingSM,
          };
        }
        default: {
          return {
            fontSize: token.fontSize,
            minHeight: 32,
            paddingHorizontal: token.paddingSM,
            paddingVertical: token.paddingXS,
          };
        }
      }
    };

    const typeStyles = getTypeStyles();
    const sizeStyles = getSizeStyles();

    return {
      button: {
        alignItems: 'center' as const,
        backgroundColor: typeStyles.backgroundColor,
        borderColor: typeStyles.borderColor,
        borderRadius: token.borderRadius,
        borderWidth: type === 'text' || type === 'link' ? 0 : 1,
        flexDirection: 'row' as const,
        justifyContent: 'center' as const,
        minHeight: sizeStyles.minHeight,
        opacity: disabled ? 0.6 : 1,
        paddingHorizontal: sizeStyles.paddingHorizontal,
        paddingVertical: sizeStyles.paddingVertical,
        width: block ? '100%' : 'auto',
      },
      loading: {
        marginRight: token.marginXS,
      },
      text: {
        color: typeStyles.textColor,
        fontSize: sizeStyles.fontSize,
        fontWeight: type === 'primary' ? '600' : '400',
        textAlign: 'center' as const,
        textDecorationLine: type === 'link' ? 'underline' : 'none',
      },
    };
  },
);
