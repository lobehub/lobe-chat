import React, { memo } from 'react';
import { View } from 'react-native';
import { createStyles } from '@/theme/ThemeProvider';

const useStyles = createStyles((token) => ({
  backButton: {
    backgroundColor: token.colorTextSecondary,
    borderRadius: 2,
    height: 8,
    width: 8,
  },

  // 聊天内容区域
  chatArea: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
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
    height: 480,
    overflow: 'hidden',
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
    borderBottomLeftRadius: 4,
    borderColor: token.colorBorderSecondary,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  messageBubbleUser: {
    backgroundColor: token.colorPrimary,
    borderBottomRightRadius: 4,
    borderRadius: 16,
    marginBottom: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  // 消息样式
  messageContainer: {
    maxWidth: '80%',
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
  sendIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 1,
    height: 8,
    width: 8,
  },
}));

const Preview = memo(() => {
  const { styles } = useStyles();

  // 移动端导航栏
  const navbar = (
    <View style={styles.navbar}>
      <View style={styles.navLeft}>
        <View style={styles.backButton} />
        <View style={styles.navTitle} />
      </View>
      <View style={styles.navRight}>
        <View style={styles.navIcon} />
        <View style={styles.navIcon} />
      </View>
    </View>
  );

  // 聊天消息内容
  const chatContent = (
    <View style={styles.chatContent}>
      {/* 用户消息 1 */}
      <View style={[styles.messageContainer, styles.messageContainerUser]}>
        <View style={styles.messageBubbleUser}>
          <View style={[styles.messageLine, styles.messageLineUser, styles.messageLinePartial]} />
          <View style={[styles.messageLine, styles.messageLineUser, styles.messageLineShort]} />
        </View>
      </View>

      {/* AI 回复消息 1 */}
      <View style={[styles.messageContainer, styles.messageContainerBot]}>
        <View style={styles.messageBubbleBot}>
          <View style={[styles.messageLine, styles.messageLineBot, styles.messageLineFull]} />
          <View style={[styles.messageLine, styles.messageLineBot, styles.messageLinePartial]} />
          <View style={[styles.messageLine, styles.messageLineBot, styles.messageLineFull]} />
          <View style={[styles.messageLine, styles.messageLineBot, styles.messageLineShort]} />
        </View>
      </View>

      {/* 用户消息 2 */}
      <View style={[styles.messageContainer, styles.messageContainerUser]}>
        <View style={styles.messageBubbleUser}>
          <View style={[styles.messageLine, styles.messageLineUser, styles.messageLineFull]} />
          <View style={[styles.messageLine, styles.messageLineUser, styles.messageLinePartial]} />
        </View>
      </View>

      {/* AI 回复消息 2 */}
      <View style={[styles.messageContainer, styles.messageContainerBot]}>
        <View style={styles.messageBubbleBot}>
          <View style={[styles.messageLine, styles.messageLineBot, styles.messageLineFull]} />
          <View style={[styles.messageLine, styles.messageLineBot, styles.messageLinePartial]} />
          <View style={[styles.messageLine, styles.messageLineBot, styles.messageLineFull]} />
          <View style={[styles.messageLine, styles.messageLineBot, styles.messageLineFull]} />
          <View style={[styles.messageLine, styles.messageLineBot, styles.messageLinePartial]} />
          <View style={[styles.messageLine, styles.messageLineBot, styles.messageLineShort]} />
        </View>
      </View>

      {/* 用户消息 3 */}
      <View style={[styles.messageContainer, styles.messageContainerUser]}>
        <View style={styles.messageBubbleUser}>
          <View style={[styles.messageLine, styles.messageLineUser, styles.messageLinePartial]} />
        </View>
      </View>

      {/* AI 回复消息 3 */}
      <View style={[styles.messageContainer, styles.messageContainerBot]}>
        <View style={styles.messageBubbleBot}>
          <View style={[styles.messageLine, styles.messageLineBot, styles.messageLineFull]} />
          <View style={[styles.messageLine, styles.messageLineBot, styles.messageLinePartial]} />
          <View style={[styles.messageLine, styles.messageLineBot, styles.messageLineFull]} />
        </View>
      </View>

      {/* 用户消息 4 */}
      <View style={[styles.messageContainer, styles.messageContainerUser]}>
        <View style={styles.messageBubbleUser}>
          <View style={[styles.messageLine, styles.messageLineUser, styles.messageLineFull]} />
          <View style={[styles.messageLine, styles.messageLineUser, styles.messageLinePartial]} />
          <View style={[styles.messageLine, styles.messageLineUser, styles.messageLineShort]} />
        </View>
      </View>

      {/* AI 回复消息 4 - 正在输入 */}
      <View style={[styles.messageContainer, styles.messageContainerBot]}>
        <View style={styles.messageBubbleBot}>
          <View style={[styles.messageLine, styles.messageLineBot, styles.messageLinePartial]} />
        </View>
      </View>
    </View>
  );

  // 输入区域
  const inputArea = (
    <View style={styles.inputArea}>
      <View style={styles.inputBox}>
        <View style={styles.inputPlaceholder} />
      </View>
      <View style={styles.sendButton}>
        <View style={styles.sendIcon} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {navbar}
      <View style={styles.chatArea}>{chatContent}</View>
      {inputArea}
    </View>
  );
});

export default Preview;
