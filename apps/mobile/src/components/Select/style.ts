import { AliasToken, createStyles } from '@/components/styles';

import { SelectSize } from './type';

interface UseStylesProps {
  size?: SelectSize;
}

interface SelectSizeStyles {
  controlHeight: number;
  fontSize: number;
  paddingHorizontal: number;
  paddingVertical: number;
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
  const sizeStyles = getSelectSizeStyles(token, size);

  return {
    container: {
      minHeight: sizeStyles.controlHeight * 1.25,
      paddingHorizontal: sizeStyles.paddingHorizontal * 1.25,
      paddingVertical: sizeStyles.paddingVertical,
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
