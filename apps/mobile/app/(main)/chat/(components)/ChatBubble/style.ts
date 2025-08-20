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
  aiMessageText: {
    color: token.colorText,
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
  codeBlockContainer: {
    backgroundColor: token.colorBgElevated,
    borderRadius: token.borderRadius,
    marginVertical: token.marginXS,
    padding: token.paddingSM,
  },
  codeText: {
    color: token.colorText,
    fontFamily: 'monospace',
    fontSize: token.fontSize,
    lineHeight: token.lineHeightSM,
  },
  messageText: {
    fontSize: token.fontSizeLG,
    lineHeight: token.lineHeight,
  },
  userBubble: {
    backgroundColor: token.colorBgContainer,
  },
  userBubbleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
}));
