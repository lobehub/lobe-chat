import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Markdown } from '@/components';
import { ChatMessage } from '@/types/message';
import LoadingDots from '../LoadingDots';
import MessageActions from '../MessageActions';
import UserContextMenu from '../UserContextMenu';
import ErrorContent from './ErrorContent';
import { useStyles } from './style';
import { useSettingStore } from '@/store/setting';
import AssistantMenu from '../AssistantMenu';

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
  }, [fontSize, hasError, isLoading, message.content, message.error]);

  return (
    <View
      style={[
        styles.bubbleContainer,
        isUser ? styles.userBubbleContainer : styles.aiBubbleContainer,
      ]}
    >
      {isAssistant ? (
        <View style={styles.aiMessageContainer}>
          <View style={styles.aiContentContainer}>
            <AssistantMenu message={message}>
              <View style={[styles.bubble, styles.aiBubble, hasError && styles.errorBubble]}>
                {content}
              </View>
            </AssistantMenu>
            {!isLoading && (message.content || hasError) && (
              <MessageActions message={message} style={styles.messageActions} />
            )}
          </View>
        </View>
      ) : (
        <View style={styles.userMessageContainer}>
          <View style={styles.userContentContainer}>
            <UserContextMenu message={message}>
              <View style={[styles.bubble, styles.userBubble, hasError && styles.errorBubble]}>
                {content}
              </View>
            </UserContextMenu>
          </View>
        </View>
      )}
    </View>
  );
});

ChatBubble.displayName = 'ChatBubble';

export default ChatBubble;
