import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  container: {
    gap: token.margin,
    padding: token.paddingSM,
  },
}));
