import { createStyles, type AliasToken } from '@/theme';
import { AggregationColor, isBright } from '@/utils/color';
import { CapsuleTabsSize } from './type';

const getSizeStyles = (
  token: AliasToken,
  size: CapsuleTabsSize,
): {
  borderRadius: number;
  fontSize: number;
  paddingHorizontal: number;
  paddingVertical: number;
} => {
  const sizeMap: Record<
    CapsuleTabsSize,
    {
      borderRadius: number;
      fontSize: number;
      paddingHorizontal: number;
      paddingVertical: number;
    }
  > = {
    large: {
      borderRadius: token.borderRadiusLG,
      fontSize: token.fontSizeLG,
      paddingHorizontal: token.paddingXL,
      paddingVertical: token.paddingSM,
    },
    middle: {
      borderRadius: token.borderRadiusLG,
      fontSize: token.fontSize,
      paddingHorizontal: token.paddingLG,
      paddingVertical: token.paddingXS,
    },
    small: {
      borderRadius: token.borderRadiusSM,
      fontSize: token.fontSizeSM,
      paddingHorizontal: token.paddingSM,
      paddingVertical: token.paddingXXS,
    },
  };

  return sizeMap[size];
};

export const useStyles = createStyles((token, size: 'large' | 'middle' | 'small' = 'middle') => {
  const activeTabColor = token.colorPrimary;
  const solidTextColor = isBright(new AggregationColor(activeTabColor), '#fff') ? '#000' : '#fff';
  const sizeStyles = getSizeStyles(token, size);

  return {
    container: {
      flexDirection: 'row',
    },
    tab: {
      alignItems: 'center',
      backgroundColor: token.colorBgContainer,
      borderRadius: sizeStyles.borderRadius,
      marginRight: token.marginXS,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      paddingVertical: sizeStyles.paddingVertical,
    },
    tabActive: {
      backgroundColor: activeTabColor,
    },
    tabContent: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    tabText: {
      color: token.colorText,
      fontSize: sizeStyles.fontSize,
      lineHeight: sizeStyles.fontSize,
      textTransform: 'capitalize',
    },
    tabTextActive: {
      color: solidTextColor,
    },
  };
});
