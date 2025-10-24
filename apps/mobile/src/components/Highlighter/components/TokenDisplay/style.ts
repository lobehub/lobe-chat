import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  codeContainer: {
    alignSelf: 'stretch',
    backgroundColor: token.colorBgContainer,
    borderRadius: 0,
    flexShrink: 1,
    margin: 0,
  },

  codeScrollContainer: {
    flexDirection: 'column',
    minWidth: '100%',
    padding: token.paddingSM,
  },
  errorText: {
    color: token.colorText,
    margin: 8,
  },
  horizontalScrollContent: {
    overflowX: 'auto',
    overflowY: 'hidden',
    padding: 16,
  },
}));
