import { UIChatMessage } from '@lobechat/types';
import { Avatar, Flexbox, Markdown, Text } from '@lobehub/ui-rn';
import { memo } from 'react';

interface WelcomeChatBubbleProps {
  message: UIChatMessage;
}

const WelcomeChatBubble = memo(({ message }: WelcomeChatBubbleProps) => {
  const meta = message.meta;
  return (
    <Flexbox gap={16} paddingBlock={16}>
      <Avatar animation avatar={meta.avatar} size={96} />
      <Flexbox gap={8} paddingBlock={16} width={'85%'}>
        <Text fontSize={24} weight={'bold'}>
          {meta.title}
        </Text>
        <Markdown
          fontSize={14}
          style={{
            opacity: 0.5,
          }}
        >
          {message.content}
        </Markdown>
      </Flexbox>
    </Flexbox>
  );
});

WelcomeChatBubble.displayName = 'WelcomeChatBubble';

export default WelcomeChatBubble;
