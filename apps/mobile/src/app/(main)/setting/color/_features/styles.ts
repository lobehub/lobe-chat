import { createStyles } from '@lobehub/ui-rn';

export const useStyles = createStyles(({ token }) => ({
  bottomBarWrapper: {
    backgroundColor: token.colorBgContainer,
    borderRadius: 24,
    bottom: 0,
    height: 300,
    left: 0,
    position: 'absolute',
    right: 0,
    width: '100%',
  },
  container: {
    flex: 1,
    width: '100%',
  },
}));
