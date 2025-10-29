import { UIChatMessage } from '@lobechat/types';
import { Avatar, Center, Flexbox, Markdown } from '@lobehub/ui-rn';
import { memo } from 'react';

import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/slices/session/selectors';
import { useSettingStore } from '@/store/setting';

interface WelcomeChatBubbleProps {
  message: UIChatMessage;
}

const WelcomeChatBubble = memo(({ message }: WelcomeChatBubbleProps) => {
  const avatar = useSessionStore(sessionMetaSelectors.currentAgentAvatar);
  const { fontSize } = useSettingStore();
  return (
    <Flexbox gap={16} paddingBlock={16}>
      <Center>
        <Avatar animation avatar={avatar} size={100} />
      </Center>
      <Markdown fontSize={fontSize}>{message.content}</Markdown>
    </Flexbox>
  );
});

WelcomeChatBubble.displayName = 'WelcomeChatBubble';

export default WelcomeChatBubble;
