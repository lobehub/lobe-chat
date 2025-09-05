import React, { useMemo } from 'react';
import { View } from 'react-native';

import { Markdown } from '@/components';
import Avatar from '@/components/Avatar';
import { ChatMessage } from '@/types/message';

import LoadingDots from '../LoadingDots';
import MessageActions from '../MessageActions';
import ToolTipActions from '../ToolTipActions';
import ErrorContent from './ErrorContent';
import { useStyles } from './style';
import { useSettingStore } from '@/store/setting';

interface ChatBubbleProps {
  isLoading?: boolean;
  message: ChatMessage;
}

const ChatBubble = React.memo(({ message, isLoading }: ChatBubbleProps) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const hasError = !!message.error;
  const { styles } = useStyles();
  const { fontSize } = useSettingStore();

  const content = useMemo(() => {
    if (hasError && message.error?.type) {
      return <ErrorContent error={message.error} />;
    }

    if (isLoading) {
      return (
        <View style={styles.loadingDotsContainer}>
          <LoadingDots />
        </View>
      );
    }

    return <Markdown fontSize={fontSize}>{message.content}</Markdown>;
  }, [hasError, message.error, isLoading, message.content]);

  // 渲染头像
  const renderAvatar = () => {
    if (!message.meta) return null;

    return (
      <Avatar
        avatar={message.meta.avatar}
        backgroundColor={message.meta.backgroundColor}
        size={32}
        title={message.meta.title}
      />
    );
  };

  return (
    <View
      style={[
        styles.bubbleContainer,
        isUser ? styles.userBubbleContainer : styles.aiBubbleContainer,
      ]}
    >
      {isAssistant ? (
        <View style={styles.aiMessageContainer}>
          {/* 助手头像 - 左侧 */}
          <View style={styles.avatarContainer}>{renderAvatar()}</View>
          <View style={styles.aiContentContainer}>
            <ToolTipActions message={message}>
              <View style={[styles.bubble, styles.aiBubble, hasError && styles.errorBubble]}>
                {content}
              </View>
            </ToolTipActions>
            {!isLoading && (message.content || hasError) && <MessageActions message={message} />}
          </View>
          <View style={{ backgroundColor: 'transparent', height: 32, width: 32 }} />
        </View>
      ) : (
        <View style={styles.userMessageContainer}>
          <View style={{ backgroundColor: 'transparent', height: 32, width: 32 }} />
          <View style={styles.userContentContainer}>
            <ToolTipActions message={message}>
              <View style={[styles.bubble, styles.userBubble, hasError && styles.errorBubble]}>
                {content}
              </View>
            </ToolTipActions>
          </View>
          {/* 用户头像 - 右侧 */}
          <View style={styles.avatarContainer}>{renderAvatar()}</View>
        </View>
      )}
    </View>
  );
});

ChatBubble.displayName = 'ChatBubble';

export default ChatBubble;
