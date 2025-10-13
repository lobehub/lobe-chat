import { createStyles } from '@/components/theme';

export const useStyles = createStyles(({ token }) => ({
  touchableWrapper: {
    borderRadius: token.borderRadius,
  },
}));
