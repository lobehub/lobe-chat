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
    padding: 16,
  },
  errorText: {
    color: token.colorText,
    margin: 8,
  },
  horizontalScrollContent: {
    padding: 16,
  },
}));
