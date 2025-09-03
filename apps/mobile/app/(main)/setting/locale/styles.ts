import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  contentContainer: {
    padding: token.paddingContentHorizontal,
  },
  safeAreaView: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
}));
