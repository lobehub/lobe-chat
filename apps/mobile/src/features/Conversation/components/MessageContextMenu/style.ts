import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  actionItemDanger: {
    backgroundColor: token.colorErrorBg,
    borderColor: token.colorErrorBorder,
  },
}));
