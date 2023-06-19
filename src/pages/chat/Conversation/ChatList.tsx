import { ChatList } from '@lobehub/ui';
import { memo } from 'react';

import { sessionSelectors, useChatStore } from '@/store/session';
import { NextPage } from 'next';
import { shallow } from 'zustand/shallow';

const List: NextPage = () => {
  const data = useChatStore((s) => {
    const chat = sessionSelectors.currentChat(s);

    return chat?.chats || [];
  }, shallow);

  return <ChatList data={data} />;
};

export default memo(List);
