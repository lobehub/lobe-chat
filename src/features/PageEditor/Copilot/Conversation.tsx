import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import type { ActionKeys } from '@/features/ChatInput';
import { ChatInput, ChatList } from '@/features/Conversation';
import NavHeader from '@/features/NavHeader';

const actions: ActionKeys[] = ['model'];

const Conversation = memo(() => {
  return (
    <Flexbox flex={1} height={'100%'}>
      <NavHeader showTogglePanelButton={false} />
      <Flexbox flex={1} style={{ overflow: 'hidden' }}>
        <ChatList />
      </Flexbox>
      <ChatInput leftActions={actions} />
    </Flexbox>
  );
});

export default Conversation;
