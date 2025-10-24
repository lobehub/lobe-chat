import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  container: {
    flex: 1,
    paddingBlock: token.marginSM,
    paddingInline: token.paddingSM,
  },
}));
