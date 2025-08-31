import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  backButton: {
    alignItems: 'center',
    backgroundColor: token.colorTextSecondary,
    borderColor: token.colorPrimary,
    borderRadius: 24,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },

  // 聊天内容区域
  chatArea: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
    height: '100%',
    overflow: 'scroll',
  },

  chatContent: {
    flex: 1,
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  container: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorder,
    borderRadius: token.borderRadiusLG,
    borderWidth: 1,
    height: 360,
    overflow: 'scroll',
    width: '100%',
  },

  // 输入区域
  inputArea: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    borderTopColor: token.colorBorderSecondary,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    height: 60,
    paddingHorizontal: 12,
  },

  inputBox: {
    backgroundColor: token.colorBgLayout,
    borderColor: token.colorBorder,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  inputPlaceholder: {
    backgroundColor: token.colorTextTertiary,
    borderRadius: 1,
    height: 2,
    width: '60%',
  },

  messageBubbleBot: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorderSecondary,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  messageBubbleUser: {
    backgroundColor: token.colorBgContainer,
    borderRadius: 6,
    marginBottom: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  // 消息样式
  messageContainer: {
    maxWidth: '75%',
  },

  messageContainerBot: {
    alignSelf: 'flex-start',
  },

  messageContainerUser: {
    alignSelf: 'flex-end',
  },

  messageLine: {
    borderRadius: 1,
    height: 2,
    marginVertical: 1,
  },

  messageLineBot: {
    backgroundColor: token.colorTextQuaternary,
  },

  messageLineFull: {
    width: '100%',
  },

  messageLinePartial: {
    width: '75%',
  },

  messageLineShort: {
    width: '45%',
  },

  messageLineUser: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },

  messageText: {
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
  },

  messageTextBot: {
    color: token.colorText,
  },

  messageTextUser: {
    color: token.colorText,
  },

  navIcon: {
    backgroundColor: token.colorTextSecondary,
    borderRadius: 2,
    height: 10,
    width: 10,
  },

  navLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  navRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  navTitle: {
    backgroundColor: token.colorTextSecondary,
    borderRadius: 2,
    height: 10,
    width: 80,
  },
  // 移动端顶部导航栏
  navbar: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    borderBottomColor: token.colorBorderSecondary,
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 44,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: token.colorPrimary,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
}));
