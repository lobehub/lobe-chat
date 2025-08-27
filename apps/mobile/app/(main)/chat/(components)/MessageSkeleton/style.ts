import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  assistantBubble: {
    width: '75%',
  },
  assistantContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  container: {
    marginVertical: token.marginXS,
    paddingHorizontal: token.paddingSM,
    width: '100%',
  },
  userBubble: {
    width: '75%',
  },
  userContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
}));
