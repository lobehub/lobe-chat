import React, { useMemo } from 'react';
import { View } from 'react-native';

import { Markdown } from '@/components';
import { ChatMessage } from '@/types/message';

import { useStyles } from './style';

interface WelcomeChatBubbleProps {
  message: ChatMessage;
}

const WelcomeChatBubble = React.memo(({ message }: WelcomeChatBubbleProps) => {
  const { styles } = useStyles();

  const content = useMemo(() => {
    return <Markdown content={message.content} />;
  }, [message.content]);

  return (
    <View style={[styles.bubbleContainer, styles.aiBubbleContainer]}>
      <View style={styles.aiMessageContainer}>
        <View style={[styles.bubble, styles.aiBubble]}>{content}</View>
      </View>
    </View>
  );
});

WelcomeChatBubble.displayName = 'WelcomeChatBubble';

export default WelcomeChatBubble;
