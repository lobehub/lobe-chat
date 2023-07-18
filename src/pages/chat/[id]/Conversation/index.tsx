import { memo } from 'react';

import HeaderSpacing from '@/features/HeaderSpacing';
import ChatInput from '@/pages/chat/[id]/Conversation/Input';

import ChatList from './ChatList';

const Conversation = () => {
  return (
    <>
      <div style={{ flex: 1, overflowY: 'scroll' }}>
        <HeaderSpacing />
        <ChatList />
      </div>
      <ChatInput />
    </>
  );
};

export default memo(Conversation);
