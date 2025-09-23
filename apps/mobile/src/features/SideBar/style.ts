import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  container: {
    flex: 1,
  },
  drawerOverlay: {
    backgroundColor: token.colorBgMask,
  },
  drawerStyle: {
    backgroundColor: token.colorBgLayout,
    width: '80%',
  },
  safeAreaView: {
    flex: 1,
  },
}));
