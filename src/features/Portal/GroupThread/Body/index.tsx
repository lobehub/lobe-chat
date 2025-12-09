'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ChatInput from '@/app/[variants]/(main)/chat/components/conversation/features/ChatInput';
import { useChatGroupStore } from '@/store/chatGroup';

import ThreadChatList from './ThreadChatList';

const Body = memo(() => {
  const activeThreadAgentId = useChatGroupStore((s) => s.activeThreadAgentId);

  return (
    <Flexbox height={'100%'}>
      <Flexbox flex={1} style={{ overflow: 'hidden', position: 'relative' }}>
        <ThreadChatList />
      </Flexbox>
      {activeThreadAgentId && <ChatInput mobile={false} targetMemberId={activeThreadAgentId} />}
    </Flexbox>
  );
});

export default Body;
