import { createStyles } from '@/theme/createStyles';

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
  avatar: {
    borderRadius: 16,
    height: 32,
    width: 32,
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
    lineHeight: 20,
  },
  messageText: {
    fontSize: token.fontSizeLG,
    lineHeight: 22,
  },
  userBubble: {
    backgroundColor: token.colorBgContainer,
  },
  userBubbleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
}));
