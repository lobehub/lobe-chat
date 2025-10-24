import { type AliasToken, createStyles } from '@/components/styles';

import { CapsuleTabsSize } from './type';

const getSizeStyles = (
  token: AliasToken,
  size: CapsuleTabsSize,
): {
  fontSize: number;
  indicatorHeight: number;
  paddingBottom: number;
  paddingHorizontal: number;
  paddingTop: number;
} => {
  const sizeMap: Record<
    CapsuleTabsSize,
    {
      fontSize: number;
      indicatorHeight: number;
      paddingBottom: number;
      paddingHorizontal: number;
      paddingTop: number;
    }
  > = {
    large: {
      fontSize: token.fontSizeLG,
      indicatorHeight: 3,
      paddingBottom: token.paddingSM,
      paddingHorizontal: token.paddingXXS,
      paddingTop: token.paddingSM,
    },
    middle: {
      fontSize: token.fontSize,
      indicatorHeight: 2,
      paddingBottom: token.paddingSM,
      paddingHorizontal: token.paddingXXS / 2,
      paddingTop: token.paddingXS,
    },
    small: {
      fontSize: token.fontSizeSM,
      indicatorHeight: 2,
      paddingBottom: token.paddingXS,
      paddingHorizontal: 0,
      paddingTop: token.paddingXXS,
    },
  };

  return sizeMap[size];
};

export const useStyles = createStyles(
  ({ token }, size: 'large' | 'middle' | 'small' = 'middle') => {
    const sizeStyles = getSizeStyles(token, size);

    return {
      container: {
        flexDirection: 'row',
      },
      contentWrapper: {
        position: 'relative',
      },
      indicator: {
        backgroundColor: token.colorPrimary,
        borderRadius: sizeStyles.indicatorHeight,
        bottom: 0,
        height: sizeStyles.indicatorHeight,
        position: 'absolute',
      },
      scrollView: {
        flexGrow: 0,
      },
      tab: {
        alignItems: 'center',
        marginRight: token.marginXS,
        paddingBottom: sizeStyles.paddingBottom,
        paddingHorizontal: sizeStyles.paddingHorizontal,
        paddingTop: sizeStyles.paddingTop,
      },
      tabContent: {
        alignItems: 'center',
        flexDirection: 'row',
      },
      tabText: {
        fontSize: sizeStyles.fontSize,
        lineHeight: sizeStyles.fontSize,
      },

      wrapper: {
        position: 'relative',
      },
    };
  },
);
