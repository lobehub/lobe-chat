import { Platform } from 'react-native';

import { AliasToken, createStyles } from '@/components/styles';

import { InputSize } from './type';

interface UseStylesProps {
  size?: InputSize;
}

interface InputSizeStyles {
  controlHeight: number;

  fontSize: number;
  paddingBlock: number;
  paddingInline: number;
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
        paddingBlock: 0,
        paddingInline: token.paddingXS,
      };
    }
    case 'large': {
      return {
        controlHeight: token.controlHeightLG,
        fontSize: 18,
        paddingBlock: token.paddingXS,
        paddingInline: token.paddingSM,
      };
    }
    default: {
      return {
        controlHeight: token.controlHeight,
        fontSize: 16,
        paddingBlock: token.paddingXXS,
        paddingInline: token.paddingSM,
      };
    }
  }
};

export const useStyles = createStyles(({ token }, { size = 'middle' }: UseStylesProps) => {
  const sizeStyles = getInputSizeStyles(token, size);

  return {
    container: {
      minHeight: sizeStyles.controlHeight * 1.25,
      paddingBlock: sizeStyles.paddingBlock,
      paddingInline: sizeStyles.paddingInline * 1.25,
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
        includeFontPadding: false,
        lineHeight: sizeStyles.fontSize * 1.25,
        margin: 0,
        paddingBlock: 0,
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
