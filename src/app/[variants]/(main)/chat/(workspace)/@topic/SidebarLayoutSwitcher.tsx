'use client';

import { memo } from 'react';

import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import GroupChatSidebar from './features/GroupChatSidebar';
import Header from './features/Header';
import SystemRole from './features/SystemRole';
import TopicListContent from './features/TopicListContent';

const SidebarSelector = memo(() => {
  const isGroupSession = useSessionStore(sessionSelectors.isCurrentSessionGroupSession);

  if (isGroupSession) {
    return <GroupChatSidebar />;
  }

  return (
    <>
      <SystemRole />
      <Header />
      <TopicListContent />
    </>
  );
});

SidebarSelector.displayName = 'SidebarSelector';

export default SidebarSelector;
