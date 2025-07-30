import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  container: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
    padding: 16,
  },
}));
