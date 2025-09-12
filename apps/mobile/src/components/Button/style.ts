import { createStyles } from '@/theme';

export type ButtonType = 'primary' | 'default' | 'text' | 'link' | 'dashed';
export type ButtonSize = 'small' | 'middle' | 'large';
export type ButtonShape = 'default' | 'circle';

export const useStyles = createStyles(
  (
    token,
    {
      type,
      size,
      disabled,
      block,
      danger,
      shape,
    }: {
      block: boolean;
      danger: boolean;
      disabled: boolean;
      shape: ButtonShape;
      size: ButtonSize;
      type: ButtonType;
    },
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
          case 'dashed': {
            return {
              backgroundColor: disabled ? token.colorBgContainerDisabled : token.colorBgContainer,
              borderColor: disabled ? token.colorBorder : token.colorError,
              textColor: disabled ? token.colorTextDisabled : token.colorError,
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
        case 'dashed': {
          return {
            backgroundColor: disabled ? token.colorBgContainerDisabled : token.colorBgContainer,
            borderColor: disabled ? token.colorBorder : token.colorBorder,
            textColor: disabled ? token.colorTextDisabled : token.colorText,
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

    const isCircle = shape === 'circle';

    return {
      button: {
        alignItems: 'center',
        backgroundColor: typeStyles.backgroundColor,
        borderColor: typeStyles.borderColor,
        borderRadius: isCircle ? sizeStyles.height / 2 : token.borderRadius,
        borderStyle: type === 'dashed' ? 'dashed' : 'solid',
        borderWidth: type === 'text' || type === 'link' ? 0 : 1,
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
        textDecorationLine: type === 'link' ? 'underline' : 'none',
      },
    };
  },
);
