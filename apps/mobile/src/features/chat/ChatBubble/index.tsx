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
            <ToolTipActions message={message}>
              <View style={[styles.bubble, styles.aiBubble, hasError && styles.errorBubble]}>
                {content}
              </View>
            </ToolTipActions>
            {!isLoading && (message.content || hasError) && (
              <MessageActions message={message} style={styles.messageActions} />
            )}
          </View>
        </View>
      ) : (
        <View style={styles.userMessageContainer}>
          <View style={styles.userContentContainer}>
            <ToolTipActions message={message}>
              <View style={[styles.bubble, styles.userBubble, hasError && styles.errorBubble]}>
                {content}
              </View>
            </ToolTipActions>
          </View>
        </View>
      )}
    </View>
  );
});

ChatBubble.displayName = 'ChatBubble';

export default ChatBubble;
