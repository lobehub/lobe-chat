import { createStyles } from '@/theme';
import { Platform } from 'react-native';

interface UseStylesProps {
  multiline?: boolean;
  size?: 'large' | 'middle' | 'small';
  variant?: 'filled' | 'borderless' | 'outlined';
}

export const useStyles = createStyles(
  (token, { multiline = false, variant = 'filled', size = 'middle' }: UseStylesProps) => {
    const getSizeStyles = () => {
      switch (size) {
        case 'small': {
          return {
            controlHeight: token.controlHeightSM,
            fontHeight: token.fontHeight,
            fontSize: token.fontSize,
            paddingHorizontal: token.paddingXS,
            paddingVertical: 0,
          };
        }
        case 'large': {
          return {
            controlHeight: token.controlHeightLG,
            fontHeight: token.fontHeightLG,
            fontSize: token.fontSizeLG,
            paddingHorizontal: token.paddingSM,
            paddingVertical: token.paddingXS,
          };
        }
        default: {
          return {
            controlHeight: token.controlHeight,
            fontHeight: token.fontHeight,
            fontSize: token.fontSize,
            paddingHorizontal: token.paddingSM,
            paddingVertical: token.paddingXXS,
          };
        }
      }
    };

    const sizeStyles = getSizeStyles();

    return {
      container: {
        alignItems: 'center',
        backgroundColor: variant === 'filled' ? token.colorFillTertiary : 'transparent',
        borderColor: variant === 'outlined' ? token.colorBorder : 'transparent',
        borderRadius: variant === 'borderless' ? 0 : token.borderRadius,
        borderWidth: variant === 'outlined' ? token.lineWidth : 0,
        display: 'flex',
        flexDirection: 'row',
        height: multiline ? undefined : sizeStyles.controlHeight,
        paddingHorizontal: sizeStyles.paddingHorizontal,
        paddingVertical: sizeStyles.paddingVertical,
      },
      input: {
        color: token.colorText,
        flex: 1,
        fontFamily: token.fontFamily,
        fontSize: sizeStyles.fontSize,
        height: multiline ? undefined : sizeStyles.fontHeight,
        // 不要设置 lineHeight
        textAlignVertical: multiline ? 'top' : 'center',
        ...(Platform.OS === 'android' && {
          // 不要影响 IOS 配置
          includeFontPadding: false,
          // 垂直居中
          paddingVertical: 0,
        }),
      },
      prefixContainer: {
        marginRight: token.marginXS,
      },
      suffixContainer: {
        marginLeft: token.marginXS,
      },
    };
  },
);
