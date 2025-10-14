import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  touchableWrapper: {
    borderRadius: token.borderRadius,
  },
}));
