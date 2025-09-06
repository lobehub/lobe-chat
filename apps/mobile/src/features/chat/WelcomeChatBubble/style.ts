import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  aiBubble: {
    width: '100%',
  },
  aiBubbleContainer: {
    flexDirection: 'row',
  },
  aiMessageContainer: {
    width: '100%',
  },
  bubble: {
    borderRadius: token.borderRadius,
    paddingHorizontal: token.paddingSM,
  },
  bubbleContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: token.marginXS,
    marginVertical: token.marginXS,
  },
}));
