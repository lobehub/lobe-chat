import React, { useMemo } from 'react';
import { View } from 'react-native';

import { Markdown } from '@/components';
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

  // 不渲染头像，因为移动端设备宽度比较小
  // const renderAvatar = () => {
  //   if (!message.meta) return null;

  //   return (
  //     <Avatar
  //       avatar={message.meta.avatar}
  //       backgroundColor={message.meta.backgroundColor}
  //       size={AVATAR_SIZE}
  //       title={message.meta.title}
  //     />
  //   );
  // };

  return (
    <View
      style={[
        styles.bubbleContainer,
        isUser ? styles.userBubbleContainer : styles.aiBubbleContainer,
      ]}
    >
      {isAssistant ? (
        <View style={styles.aiMessageContainer}>
          <ToolTipActions message={message}>
            <View style={[styles.bubble, styles.aiBubble, hasError && styles.errorBubble]}>
              {content}
            </View>
          </ToolTipActions>
          {!isLoading && (message.content || hasError) && <MessageActions message={message} />}
        </View>
      ) : (
        <View style={styles.userMessageContainer}>
          <ToolTipActions message={message}>
            <View style={[styles.bubble, styles.userBubble, hasError && styles.errorBubble]}>
              {content}
            </View>
          </ToolTipActions>
        </View>
      )}
    </View>
  );
});

ChatBubble.displayName = 'ChatBubble';

export default ChatBubble;
