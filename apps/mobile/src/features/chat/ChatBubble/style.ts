import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
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
  bubble: {},
  bubbleContainer: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    paddingBlock: 8,
  },
  codeBlockContainer: {
    backgroundColor: token.colorBgElevated,
    borderRadius: token.borderRadius,
    marginVertical: token.marginXS,
    padding: token.paddingSM,
  },
  codeText: {
    color: token.colorText,
    fontFamily: token.fontFamilyCode,
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
    paddingBlock: token.paddingSM,
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
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    minHeight: 32,
    paddingBlock: 8,
    paddingInline: 16,
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
