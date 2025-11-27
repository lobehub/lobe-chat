import { ChatHeader } from '@lobehub/ui/chat';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ChatInput, ChatList } from '@/features/Conversation';

const Conversation = memo(() => {
  return (
    <Flexbox flex={1} height={'100%'}>
      <ChatHeader />
      <Flexbox flex={1} height={'100%'}>
        <ChatList />
      </Flexbox>
      <ChatInput />
    </Flexbox>
  );
});

export default Conversation;
