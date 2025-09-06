import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  aiBubble: {
    flex: 1,
    marginVertical: -token.marginXS,
  },
  aiBubbleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
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
    paddingHorizontal: token.paddingSM,
  },
  bubbleContainer: {
    alignItems: 'flex-start',
    flexDirection: 'column',
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

  messageText: {
    fontSize: token.fontSizeLG,
    lineHeight: token.lineHeight,
  },

  userBubble: {
    backgroundColor: token.colorFillTertiary,
  },

  userBubbleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    maxWidth: '90%',
  },

  userMessageContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: token.marginXS,
    justifyContent: 'flex-end',
  },
}));
