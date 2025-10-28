import { darken, rgba } from 'polished';
import { StyleSheet } from 'react-native';

import { DRAWER_WIDTH } from '@/_const/theme';
import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token, isDarkMode }) => ({
  drawerBackground: {
    backgroundColor: isDarkMode ? token.colorBgContainerSecondary : token.colorBgLayout,
  },

  // 抽屉内容容器
  drawerContent: {
    flex: 1,
  },
  drawerOverlay: {
    backgroundColor: isDarkMode ? 'rgba(0,0,0,.8)' : rgba(darken(0.1, token.colorBgLayout), 0.5),
    borderColor: token.colorFillTertiary,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  drawerStyle: {
    backgroundColor: token.colorBgLayout,
    width: DRAWER_WIDTH,
  },
  headerTitle: {
    color: token.colorTextHeading,
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
  },
}));
