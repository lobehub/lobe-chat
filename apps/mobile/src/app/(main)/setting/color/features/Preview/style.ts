import { createStyles } from '@lobehub/ui-rn';

export const useStyles = createStyles(({ token }) => {
  return {
    backButton: {
      alignItems: 'center',
      backgroundColor: token.colorTextSecondary,
      borderColor: token.colorPrimary,
      borderRadius: 24,
      height: 24,
      justifyContent: 'center',
      width: 24,
    },

    // 聊天内容区域
    chatArea: {},

    chatContent: {
      backgroundColor: token.colorBgLayout,
      gap: token.marginSM,
      paddingBlock: token.paddingSM,
      paddingInline: token.paddingSM,
    },

    container: {
      backgroundColor: token.colorBgContainer,
      borderColor: token.colorBorder,
      borderRadius: token.borderRadiusLG,
      borderWidth: 0.5,
    },

    // 输入区域
    inputArea: {
      alignItems: 'center',
      backgroundColor: token.colorBgContainer,
      borderRadius: token.borderRadiusLG,
      flexDirection: 'row',
      gap: token.marginXS,
      height: 60,
      paddingInline: token.paddingSM,
    },

    inputBox: {
      backgroundColor: token.colorBgLayout,
      borderColor: token.colorBorder,
      borderRadius: 18,
      borderWidth: 0.5,
      flex: 1,
      height: 36,
      justifyContent: 'center',
      paddingInline: token.paddingSM,
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
      borderRadius: token.borderRadius,
      borderWidth: 0.5,
      marginBottom: 2,
      paddingBlock: token.paddingXS,
      paddingInline: 10,
    },

    messageBubbleUser: {
      backgroundColor: token.colorBgContainer,
      borderRadius: token.borderRadius,
      marginBottom: 2,
      paddingBlock: token.paddingXS,
      paddingInline: 10,
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
      borderRadius: token.borderRadiusXS,
      height: 10,
      width: 10,
    },

    navLeft: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: token.marginXS,
    },

    navRight: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: token.marginXS,
    },

    navTitle: {
      backgroundColor: token.colorTextSecondary,
      borderRadius: token.borderRadiusXS,
      height: 10,
      width: 80,
    },
    // 移动端顶部导航栏
    navbar: {
      alignItems: 'center',
      backgroundColor: token.colorBgContainer,
      borderRadius: token.borderRadiusLG,
      flexDirection: 'row',
      height: 44,
      justifyContent: 'space-between',
      paddingInline: token.padding,
    },
    sendButton: {
      alignItems: 'center',
      backgroundColor: token.colorPrimary,
      borderRadius: 18,
      height: 36,
      justifyContent: 'center',
      width: 36,
    },
  };
});
