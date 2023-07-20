import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import HeaderSpacing from '@/features/HeaderSpacing';
import ChatInput from '@/pages/chat/[id]/Conversation/Input';

import ChatList from './ChatList';

const Conversation = () => {
  return (
    <Flexbox flex={1}>
      <div style={{ flex: 1, overflowY: 'scroll' }}>
        <HeaderSpacing />
        <ChatList />
      </div>
      <ChatInput />
    </Flexbox>
  );
};

export default memo(Conversation);
