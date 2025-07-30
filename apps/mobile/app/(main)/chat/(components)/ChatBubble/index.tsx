import React, { useMemo } from 'react';
import { View } from 'react-native';

import { Markdown } from '@/components';
import { ChatMessage } from '@/types/message';

import LoadingDots from '../LoadingDots';
import MessageActions from '../MessageActions';
import ToolTipActions from '../ToolTipActions';
import { useStyles } from './style';

interface ChatBubbleProps {
  isLoading?: boolean;
  message: ChatMessage;
}

const ChatBubble = React.memo(({ message, isLoading }: ChatBubbleProps) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const { styles } = useStyles();

  const content = useMemo(() => {
    if (isLoading) {
      return <LoadingDots />;
    }
    return <Markdown content={message.content} />;
  }, [isLoading, message.content]);

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
            <View style={[styles.bubble, styles.aiBubble]}>{content}</View>
          </ToolTipActions>
          {!isLoading && message.content && <MessageActions message={message} />}
        </View>
      ) : (
        <ToolTipActions message={message}>
          <View style={[styles.bubble, styles.userBubble]}>{content}</View>
        </ToolTipActions>
      )}
    </View>
  );
});

ChatBubble.displayName = 'ChatBubble';

export default ChatBubble;
