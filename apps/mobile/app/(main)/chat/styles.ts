import { createStyles, getAlphaColor } from '@/theme';

export const useStyles = createStyles((token) => ({
  chatContainer: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
  container: {
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
