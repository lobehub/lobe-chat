import { createStyles } from '@/theme';
import { Platform } from 'react-native';

interface UseStylesProps {
  multiline?: boolean;
  size?: 'large' | 'middle' | 'small';
  variant?: 'filled' | 'borderless' | 'outlined';
}

const getVerticalPadding = (controlHeight: number, lineHeight: number) =>
  Math.max(Math.round((controlHeight - lineHeight) / 2), 0);

export const useStyles = createStyles(
  (token, { multiline = false, variant = 'filled', size = 'middle' }: UseStylesProps) => {
    const getSizeStyles = () => {
      switch (size) {
        case 'small': {
          return {
            controlHeight: token.controlHeightSM,
            fontSize: token.fontSizeSM,
            lineHeight: token.lineHeightSM,
            paddingHorizontal: token.paddingContentHorizontalSM,
            paddingVertical: getVerticalPadding(token.controlHeightSM, token.lineHeightSM),
          };
        }
        case 'large': {
          return {
            controlHeight: token.controlHeightLG,
            fontSize: token.fontSizeLG,
            lineHeight: token.lineHeightLG,
            paddingHorizontal: token.paddingContentHorizontalLG,
            paddingVertical: getVerticalPadding(token.controlHeightLG, token.lineHeightLG),
          };
        }
        default: {
          return {
            controlHeight: token.controlHeight,
            fontSize: token.fontSize,
            lineHeight: token.lineHeight,
            paddingHorizontal: token.paddingContentHorizontal,
            paddingVertical: getVerticalPadding(token.controlHeight, token.lineHeight),
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
        minHeight: multiline ? undefined : sizeStyles.controlHeight,
        paddingHorizontal: variant === 'borderless' ? 0 : sizeStyles.paddingHorizontal,
        paddingVertical: variant === 'borderless' ? 0 : sizeStyles.paddingVertical,
      },
      input: {
        color: token.colorText,
        flex: 1,
        fontFamily: token.fontFamily,
        fontSize: sizeStyles.fontSize,
        height: undefined,
        lineHeight: multiline ? token.lineHeightLG : sizeStyles.lineHeight,
        textAlignVertical: multiline ? 'top' : 'center',
        ...(Platform.OS === 'android' && {
          includeFontPadding: false,
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
