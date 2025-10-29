import { darken, mix, rgba } from 'polished';
import { StyleSheet } from 'react-native';

import { DRAWER_WIDTH } from '@/_const/theme';
import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token, isDarkMode }) => ({
  drawerBackground: {
    backgroundColor: 'transparent',
  },

  // 抽屉内容容器
  drawerContent: {
    flex: 1,
  },
  drawerOverlay: {
    backgroundColor: isDarkMode
      ? 'rgba(0,0,0,.8)'
      : rgba(mix(0.5, '#000', darken(0.2, token.colorBgLayout)), 0.2),
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
