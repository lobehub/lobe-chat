'use client';

import { memo } from 'react';

import { ChatItem } from '@/features/Conversation';

export interface ThreadChatItemProps {
  id: string;
  index: number;
}

const ThreadChatItem = memo<ThreadChatItemProps>(({ id, index }) => {
  // For thread view, we don't need history divider
  const enableHistoryDivider = false;

  return (
    <ChatItem
      enableHistoryDivider={enableHistoryDivider}
      id={id}
      inPortalThread={true} // Mark this as thread context
      index={index}
    />
  );
});

export default ThreadChatItem;
