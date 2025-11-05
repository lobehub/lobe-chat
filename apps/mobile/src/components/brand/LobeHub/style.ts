import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  extraTitle: {
    color: token.colorText,
    fontWeight: '300' as const,
  },
}));
