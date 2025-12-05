import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ChatInput, ChatList } from '@/features/Conversation';
import NavHeader from '@/features/NavHeader';

const Conversation = memo(() => {
  return (
    <Flexbox flex={1} height={'100%'}>
      <NavHeader showTogglePanelButton={false} />
      <Flexbox flex={1} height={'100%'}>
        <ChatList />
      </Flexbox>
      <ChatInput />
    </Flexbox>
  );
});

export default Conversation;
