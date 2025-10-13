import { createStyles } from '@/components/theme';

export const useStyles = createStyles(({ token }) => ({
  container: {
    gap: token.margin,
    padding: token.paddingSM,
  },
}));
