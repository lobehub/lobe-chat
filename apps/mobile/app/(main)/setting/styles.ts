import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  container: {
    padding: token.paddingContentHorizontal,
  },
  safeAreaView: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
}));
