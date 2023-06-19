import { memo } from 'react';

import { NextPage } from 'next';

import ChatList from './ChatList';
import ChatInput from './Input';

const Conversation: NextPage = () => {
  return (
    <>
      <div style={{ flex: 1 }}>
        <ChatList />
      </div>
      <ChatInput />
    </>
  );
};

export default memo(Conversation);
