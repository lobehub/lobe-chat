import { createStyles, getAlphaColor } from '@/theme';

export const useStyles = createStyles((token) => ({
  // 抽屉内容容器
  drawerContent: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },

  drawerOverlay: {
    backgroundColor: getAlphaColor(token.colorBorderBg, 0.9),
  },
  drawerStyle: {
    backgroundColor: token.colorBgLayout,
    width: '80%',
  },
}));
