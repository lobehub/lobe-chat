import { createStyles, getAlphaColor } from '@/theme';

export const useStyles = createStyles((token) => ({
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
