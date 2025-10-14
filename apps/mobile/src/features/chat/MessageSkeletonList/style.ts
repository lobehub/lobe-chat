import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  container: {
    flex: 1,
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.marginSM,
  },
}));
