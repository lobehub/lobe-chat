import { createStyles } from '@/theme';
import { AggregationColor, isBright } from '@/utils/color';

export const useStyles = createStyles((token) => {
  const activeTabColor = token.colorPrimary;
  const solidTextColor = isBright(new AggregationColor(activeTabColor), '#fff') ? '#000' : '#fff';

  return {
    container: {
      flexDirection: 'row',
    },
    tab: {
      backgroundColor: token.colorBgContainer,
      borderRadius: token.borderRadiusLG,
      marginRight: token.marginXS,
      paddingHorizontal: token.paddingLG,
      paddingVertical: token.paddingXS,
    },
    tabActive: {
      backgroundColor: activeTabColor,
    },
    tabText: {
      color: token.colorText,
      fontSize: token.fontSize,
      textTransform: 'capitalize',
    },
    tabTextActive: {
      color: solidTextColor,
    },
  };
});
