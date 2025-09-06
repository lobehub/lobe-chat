import { createStyles, getAlphaColor } from '@/theme';

export const useStyles = createStyles((token) => ({
  chatContainer: {
    flex: 1,
  },
  drawerOverlay: {
    backgroundColor: getAlphaColor(token.colorBorderBg, 0.9),
  },
  drawerStyle: {
    backgroundColor: token.colorBgLayout,
    width: '80%',
  },
  safeAreaView: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
}));
