import { Platform } from 'react-native';

import { AliasToken, createStyles } from '@/components/styles';

import { InputSize } from './type';

interface UseStylesProps {
  size?: InputSize;
}

interface InputSizeStyles {
  controlHeight: number;

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
        fontSize: 14,
        paddingHorizontal: token.paddingXS,
        paddingVertical: 0,
      };
    }
    case 'large': {
      return {
        controlHeight: token.controlHeightLG,
        fontSize: 18,
        paddingHorizontal: token.paddingSM,
        paddingVertical: token.paddingXS,
      };
    }
    default: {
      return {
        controlHeight: token.controlHeight,
        fontSize: 16,
        paddingHorizontal: token.paddingSM,
        paddingVertical: token.paddingXXS,
      };
    }
  }
};

export const useStyles = createStyles(({ token }, { size = 'middle' }: UseStylesProps) => {
  const sizeStyles = getInputSizeStyles(token, size);

  return {
    container: {
      minHeight: sizeStyles.controlHeight * 1.25,
      paddingHorizontal: sizeStyles.paddingHorizontal * 1.25,
      paddingVertical: sizeStyles.paddingVertical,
    },
    input: {
      color: token.colorText,
      flex: 1,
      fontFamily: token.fontFamily,
      fontSize: sizeStyles.fontSize,
      padding: 0,
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
});
