import { DRAWER_WIDTH } from '@/_const/theme';
import { createStyles } from '@/theme';

export const useStyles = createStyles(({ token }) => ({
  // 抽屉内容容器
  drawerContent: {
    flex: 1,
  },

  drawerOverlay: {
    backgroundColor: token.colorBgMask,
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
