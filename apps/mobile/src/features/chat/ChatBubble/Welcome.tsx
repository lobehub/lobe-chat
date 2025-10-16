import { ChatMessage } from '@lobechat/types';
import { Avatar, Center, Flexbox, Markdown } from '@lobehub/ui-rn';
import { memo } from 'react';

import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/slices/session/selectors';

interface WelcomeChatBubbleProps {
  message: ChatMessage;
}

const WelcomeChatBubble = memo(({ message }: WelcomeChatBubbleProps) => {
  const avatar = useSessionStore(sessionMetaSelectors.currentAgentAvatar);
  return (
    <Flexbox gap={16} paddingBlock={16}>
      <Center>
        <Avatar animation avatar={avatar} size={100} />
      </Center>
      <Markdown>{message.content}</Markdown>
    </Flexbox>
  );
});

WelcomeChatBubble.displayName = 'WelcomeChatBubble';

export default WelcomeChatBubble;
