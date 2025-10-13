import { ChatMessage } from '@lobechat/types';
import { Markdown } from '@lobehub/ui-rn';
import { memo, useMemo } from 'react';
import { View } from 'react-native';

import { useStyles } from './style';

interface WelcomeChatBubbleProps {
  message: ChatMessage;
}

const WelcomeChatBubble = memo(({ message }: WelcomeChatBubbleProps) => {
  const { styles } = useStyles();

  const content = useMemo(() => {
    return <Markdown>{message.content}</Markdown>;
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
