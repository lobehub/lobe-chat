import { darken, rgba } from 'polished';

import { DRAWER_WIDTH } from '@/_const/theme';
import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token, isDarkMode }) => ({
  drawerBackground: {
    backgroundColor: token.colorBgContainerSecondary,
  },

  // 抽屉内容容器
  drawerContent: {
    flex: 1,
  },
  drawerOverlay: {
    backgroundColor: isDarkMode ? token.colorBgMask : rgba(darken(0.1, token.colorBgLayout), 0.5),
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
