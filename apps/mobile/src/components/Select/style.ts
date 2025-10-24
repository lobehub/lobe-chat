import { AliasToken, createStyles } from '@/components/styles';

import { SelectSize } from './type';

interface UseStylesProps {
  size?: SelectSize;
}

interface SelectSizeStyles {
  controlHeight: number;
  fontSize: number;
  paddingBlock: number;
  paddingInline: number;
}

export const getSelectSizeStyles = (
  token: AliasToken,
  size: SelectSize = 'middle',
): SelectSizeStyles => {
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
  const sizeStyles = getSelectSizeStyles(token, size);

  return {
    container: {
      minHeight: sizeStyles.controlHeight * 1.25,
      paddingBlock: sizeStyles.paddingBlock,
      paddingInline: sizeStyles.paddingInline * 1.25,
    },
    option: {
      borderRadius: token.borderRadiusLG,
      minHeight: 48,
    },
    optionSelected: {
      backgroundColor: token.colorFillTertiary,
    },
    prefixContainer: {
      marginRight: token.marginXS,
    },
    sizeStyles,
    suffixContainer: {
      marginLeft: token.marginXS,
    },
  };
});
