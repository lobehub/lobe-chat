import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  root: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
  safeAreaView: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
}));
