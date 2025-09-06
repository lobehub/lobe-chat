import { createStyles } from '@/theme';

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
      danger,
    }: { block: boolean; danger: boolean; disabled: boolean; size: ButtonSize; type: ButtonType },
  ) => {
    const getTypeStyles = () => {
      if (danger) {
        switch (type) {
          case 'primary': {
            return {
              backgroundColor: disabled ? token.colorBgContainerDisabled : token.colorError,
              borderColor: disabled ? token.colorPrimaryBorder : token.colorError,
              textColor: disabled ? token.colorTextDisabled : token.colorBgLayout,
            };
          }
          case 'text': {
            return {
              backgroundColor: 'transparent',
              borderColor: 'transparent',
              textColor: disabled ? token.colorTextDisabled : token.colorError,
            };
          }
          case 'link': {
            return {
              backgroundColor: 'transparent',
              borderColor: 'transparent',
              textColor: disabled ? token.colorTextDisabled : token.colorError,
            };
          }
          default: {
            return {
              backgroundColor: disabled ? token.colorBgContainerDisabled : token.colorBgContainer,
              borderColor: disabled ? token.colorBorder : token.colorError,
              textColor: disabled ? token.colorTextDisabled : token.colorError,
            };
          }
        }
      }

      switch (type) {
        case 'primary': {
          return {
            backgroundColor: disabled ? token.colorBgContainerDisabled : token.colorPrimary,
            borderColor: disabled ? token.colorPrimaryBorder : token.colorBgElevated,
            textColor: disabled ? token.colorTextDisabled : token.colorTextLightSolid,
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
        minHeight: sizeStyles.height,
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
        textAlign: 'center' as const,
        textDecorationLine: type === 'link' ? 'underline' : 'none',
      },
    };
  },
);
