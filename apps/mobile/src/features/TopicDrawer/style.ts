import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  // 抽屉内容容器
  drawerContent: {
    flex: 1,
  },

  drawerOverlay: {
    backgroundColor: token.colorBgMask,
  },
  drawerStyle: {
    backgroundColor: token.colorBgContainer,
    width: '80%',
  },
  safeAreaView: {
    flex: 1,
  },
}));
