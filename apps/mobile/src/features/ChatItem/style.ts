import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  aiBubble: {
    maxWidth: '100%',
    minHeight: 32,
  },

  userBubble: {
    backgroundColor: token.colorBgContainer,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxWidth: '100%',
    minHeight: 32,
    paddingBlock: 8,
    paddingInline: 16,
  },
}));
