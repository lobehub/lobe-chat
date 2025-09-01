import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { useStyles } from './style';
import { useTranslation } from 'react-i18next';

const Preview = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation(['setting']);

  // 移动端导航栏
  const navbar = (
    <View style={styles.navbar}>
      <View style={styles.navLeft}>
        <View style={styles.backButton} />
        <View style={styles.navTitle} />
      </View>
      <View style={styles.navRight}>
        <View style={styles.navIcon} />
        <View style={styles.navIcown} />
      </View>
    </View>
  );

  // 聊天消息内容
  const chatContent = (
    <View style={styles.chatContent}>
      {/* 用户消息 1 */}
      <View style={[styles.messageContainer, styles.messageContainerUser]}>
        <View style={styles.messageBubbleUser}>
          <Text style={[styles.messageText, styles.messageTextUser]}>
            {t('theme.previewMessages.userHowToUse', { ns: 'setting' })}
          </Text>
        </View>
      </View>

      {/* AI 回复消息 1 */}
      <View style={[styles.messageContainer, styles.messageContainerBot]}>
        <View style={styles.messageBubbleBot}>
          <Text style={[styles.messageText, styles.messageTextBot]}>
            {t('theme.previewMessages.botHowToUse', { ns: 'setting' })}
          </Text>
        </View>
      </View>

      {/* <View style={[styles.messageContainer, styles.messageContainerUser]}>
        <View style={styles.messageBubbleUser}>
          <Text style={[styles.messageText, styles.messageTextUser]}>很棒！</Text>
        </View>
      </View> */}

      {/* 用户消息 2 */}
      {/* <View style={[styles.messageContainer, styles.messageContainerUser]}>
        <View style={styles.messageBubbleUser}>
          <Text style={[styles.messageText, styles.messageTextUser]}>能切换到深色模式看看吗？</Text>
        </View>
      </View> */}

      {/* AI 回复消息 2 */}
      {/* <View style={[styles.messageContainer, styles.messageContainerBot]}>
        <View style={styles.messageBubbleBot}>
          <Text style={[styles.messageText, styles.messageTextBot]}>
            当然可以！你可以关闭&quot;跟随系统&quot;开关，然后选择深色模式。预览界面会立即反映深色主题下的颜色效果，包括背景色、文字颜色和边框颜色的变化。
          </Text>
        </View>
      </View> */}

      {/* 用户消息 3 */}
      {/* <View style={[styles.messageContainer, styles.messageContainerUser]}>
        <View style={styles.messageBubbleUser}>
          <Text style={[styles.messageText, styles.messageTextUser]}>很棒！</Text>
        </View>
      </View> */}

      {/* AI 回复消息 3 */}
      {/* <View style={[styles.messageContainer, styles.messageContainerBot]}>
        <View style={styles.messageBubbleBot}>
          <Text style={[styles.messageText, styles.messageTextBot]}>
            很高兴你喜欢！这个预览功能让你可以在应用设置之前直观地看到主题效果。
          </Text>
        </View>
      </View> */}

      {/* 用户消息 4 */}
      {/* <View style={[styles.messageContainer, styles.messageContainerUser]}>
        <View style={styles.messageBubbleUser}>
          <Text style={[styles.messageText, styles.messageTextUser]}>字体大小也能调整吗？</Text>
        </View>
      </View> */}

      {/* AI 回复消息 4 - 正在输入 */}
      {/* <View style={[styles.messageContainer, styles.messageContainerBot]}>
        <View style={styles.messageBubbleBot}>
          <Text style={[styles.messageText, styles.messageTextBot]}>当然可以...</Text>
        </View>
      </View> */}
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
