import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  aiBubble: {
    maxWidth: '100%',
    minHeight: 32,
  },
  errorBubble: {
    backgroundColor: token.colorWarningBg,
    borderColor: token.colorWarningBorder,
    borderWidth: 1,
    marginVertical: token.marginXS,
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
