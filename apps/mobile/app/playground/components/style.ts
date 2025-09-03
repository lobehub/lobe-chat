import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  safeAreaView: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
}));
