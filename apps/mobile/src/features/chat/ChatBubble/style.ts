import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  aiBubble: {
    flex: 1,
  },
  aiBubbleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  aiContentContainer: {
    flex: 1,
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: token.marginXS,
    width: '100%',
  },
  aiMessageText: {
    color: token.colorText,
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: token.paddingXXS,
  },
  bubble: {
    borderRadius: token.borderRadius,
  },
  bubbleContainer: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    marginHorizontal: token.margin,
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
  // Error state styles (using warning colors to match web)
  errorBubble: {
    backgroundColor: token.colorWarningBg,
    borderColor: token.colorWarningBorder,
    borderWidth: 1,
    marginVertical: token.marginXS,
  },

  loadingDotsContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: token.marginXS,
    paddingVertical: token.paddingSM,
  },

  messageActions: {
    marginTop: token.marginXXS,
  },

  messageText: {
    fontSize: token.fontSizeLG,
    lineHeight: token.lineHeight,
  },

  userBubble: {
    backgroundColor: token.colorBgContainer,
    paddingHorizontal: token.paddingSM,
  },

  userBubbleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  userContentContainer: {
    maxWidth: '90%',
  },

  userMessageContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: token.marginXS,
    justifyContent: 'flex-end',
    width: '100%',
  },
}));
