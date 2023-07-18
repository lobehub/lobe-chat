import { memo } from 'react';

import ChatInput from '@/pages/chat/[id]/Conversation/Input';

import ChatList from './ChatList';

const Conversation = () => {
  return (
    <>
      <div style={{ flex: 1, overflowY: 'scroll' }}>
        <ChatList />
      </div>
      <ChatInput />
    </>
  );
};

export default memo(Conversation);
