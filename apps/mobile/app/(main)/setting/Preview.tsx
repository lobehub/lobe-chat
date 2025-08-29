import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { createStyles } from '@/theme/ThemeProvider';

const useStyles = createStyles((token) => ({
  backButton: {
    alignItems: 'center',
    backgroundColor: token.colorTextSecondary,
    borderColor: token.primaryColor,
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
    fontSize: 12,
    lineHeight: 16,
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
          <Text style={[styles.messageText, styles.messageTextUser]}>主题预览看起来怎么样？</Text>
        </View>
      </View>

      {/* AI 回复消息 1 */}
      <View style={[styles.messageContainer, styles.messageContainerBot]}>
        <View style={styles.messageBubbleBot}>
          <Text style={[styles.messageText, styles.messageTextBot]}>
            这个主题预览展示了当前的主色和中性色配置。你可以通过下面的颜色选择器来调整主色和中性色，预览会实时更新以显示效果。
          </Text>
        </View>
      </View>

      {/* 用户消息 2 */}
      <View style={[styles.messageContainer, styles.messageContainerUser]}>
        <View style={styles.messageBubbleUser}>
          <Text style={[styles.messageText, styles.messageTextUser]}>能切换到深色模式看看吗？</Text>
        </View>
      </View>

      {/* AI 回复消息 2 */}
      <View style={[styles.messageContainer, styles.messageContainerBot]}>
        <View style={styles.messageBubbleBot}>
          <Text style={[styles.messageText, styles.messageTextBot]}>
            当然可以！你可以关闭&quot;跟随系统&quot;开关，然后选择深色模式。预览界面会立即反映深色主题下的颜色效果，包括背景色、文字颜色和边框颜色的变化。
          </Text>
        </View>
      </View>

      {/* 用户消息 3 */}
      <View style={[styles.messageContainer, styles.messageContainerUser]}>
        <View style={styles.messageBubbleUser}>
          <Text style={[styles.messageText, styles.messageTextUser]}>很棒！</Text>
        </View>
      </View>

      {/* AI 回复消息 3 */}
      <View style={[styles.messageContainer, styles.messageContainerBot]}>
        <View style={styles.messageBubbleBot}>
          <Text style={[styles.messageText, styles.messageTextBot]}>
            很高兴你喜欢！这个预览功能让你可以在应用设置之前直观地看到主题效果。
          </Text>
        </View>
      </View>

      {/* 用户消息 4 */}
      <View style={[styles.messageContainer, styles.messageContainerUser]}>
        <View style={styles.messageBubbleUser}>
          <Text style={[styles.messageText, styles.messageTextUser]}>字体大小也能调整吗？</Text>
        </View>
      </View>

      {/* AI 回复消息 4 - 正在输入 */}
      <View style={[styles.messageContainer, styles.messageContainerBot]}>
        <View style={styles.messageBubbleBot}>
          <Text style={[styles.messageText, styles.messageTextBot]}>当然可以...</Text>
        </View>
      </View>
    </View>
  );

  // 输入区域
  const inputArea = (
    <View style={styles.inputArea}>
      <View style={styles.inputBox} />
      <View style={styles.sendButton} />
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
