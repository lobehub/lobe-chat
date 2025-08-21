import React, { memo } from 'react';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { sessionSelectors } from '@/store/session/selectors';
import { useSessionStore } from '@/store/session/store';

import InboxWelcome from './InboxWelcome';
import GroupWelcome from './GroupWelcome';
import WelcomeMessage from './WelcomeMessage';

const WelcomeChatItem = memo(() => {
  const showInboxWelcome = useChatStore(chatSelectors.showInboxWelcome);
  const isGroupSession = useSessionStore(sessionSelectors.isCurrentSessionGroupSession);

  if (showInboxWelcome) return <InboxWelcome />;

  if (isGroupSession) return <GroupWelcome />;

  return <WelcomeMessage />;
});

export default WelcomeChatItem;
