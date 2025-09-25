import { Platform } from 'react-native';

import { AliasToken, createStyles } from '@/theme';

import { InputSize, InputVariant } from './type';

interface UseStylesProps {
  size?: InputSize;
  variant?: InputVariant;
}

interface InputSizeStyles {
  controlHeight: number;
  fontHeight: number;
  fontSize: number;
  paddingHorizontal: number;
  paddingVertical: number;
}

export const getInputSizeStyles = (
  token: AliasToken,
  size: InputSize = 'middle',
): InputSizeStyles => {
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

export const useStyles = createStyles(
  ({ token }, { variant = 'filled', size = 'middle' }: UseStylesProps) => {
    const sizeStyles = getInputSizeStyles(token, size);

    return {
      container: {
        alignItems: 'center',
        backgroundColor: variant === 'filled' ? token.colorFillTertiary : 'transparent',
        borderColor: variant === 'outlined' ? token.colorBorder : 'transparent',
        borderRadius: variant === 'borderless' ? 0 : token.borderRadius,
        borderWidth: variant === 'outlined' ? token.lineWidth : 0,
        display: 'flex',
        flexDirection: 'row',
        height: sizeStyles.controlHeight,
        paddingHorizontal: sizeStyles.paddingHorizontal,
        paddingVertical: sizeStyles.paddingVertical,
      },
      input: {
        color: token.colorText,
        flex: 1,
        fontFamily: token.fontFamily,
        fontSize: sizeStyles.fontSize,
        height: sizeStyles.fontHeight,
        // 不要设置 lineHeight
        textAlignVertical: 'center',
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
