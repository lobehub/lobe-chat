import { ChatMessage } from '@lobechat/types';
import { Markdown } from '@lobehub/ui-rn';
import { memo } from 'react';

interface WelcomeChatBubbleProps {
  message: ChatMessage;
}

const WelcomeChatBubble = memo(({ message }: WelcomeChatBubbleProps) => {
  return <Markdown>{message.content}</Markdown>;
});

WelcomeChatBubble.displayName = 'WelcomeChatBubble';

export default WelcomeChatBubble;
