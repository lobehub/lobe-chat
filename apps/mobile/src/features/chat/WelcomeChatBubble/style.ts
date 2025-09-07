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
    padding: token.paddingXXS,
  },
  bubbleContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: token.marginXS,
    paddingHorizontal: token.paddingSM,
  },
}));
