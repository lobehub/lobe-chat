import { createStyles } from '@/components/theme';

export const useStyles = createStyles(({ token }) => ({
  assistantBubble: {
    width: '100%',
  },
  assistantContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  container: {
    marginVertical: token.marginXS,
    width: '100%',
  },
  userBubble: {
    width: '90%',
  },
  userContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
}));
