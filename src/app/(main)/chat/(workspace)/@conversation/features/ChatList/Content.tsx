'use client';

import isEqual from 'fast-deep-equal';
import React, { memo } from 'react';

import { WELCOME_GUIDE_CHAT_ID } from '@/const/session';
import { VirtualizedList } from '@/features/Conversation';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useSessionStore } from '@/store/session';

interface ListProps {
  mobile?: boolean;
}

const Content = memo<ListProps>(({ mobile }) => {
  const [activeTopicId, useFetchMessages] = useChatStore((s) => [
    s.activeTopicId,
    s.useFetchMessages,
  ]);

  const [sessionId] = useSessionStore((s) => [s.activeId]);
  useFetchMessages(sessionId, activeTopicId);

  const data = useChatStore((s) => {
    const showInboxWelcome = chatSelectors.showInboxWelcome(s);
    if (showInboxWelcome) return [WELCOME_GUIDE_CHAT_ID];

    return chatSelectors.currentChatIDsWithGuideMessage(s);
  }, isEqual);

  return <VirtualizedList dataSource={data} mobile={mobile} />;
});

export default Content;
