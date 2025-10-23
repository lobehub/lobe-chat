import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  actionItemDanger: {
    backgroundColor: token.colorErrorBg,
  },
  actionLabelDanger: {
    color: token.colorError,
  },
}));
