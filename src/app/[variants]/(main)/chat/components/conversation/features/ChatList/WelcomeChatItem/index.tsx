import React, { memo } from 'react';

import { sessionSelectors } from '@/store/session/selectors';
import { useSessionStore } from '@/store/session/store';

import AgentWelcome from './AgentWelcome';
import GroupWelcome from './GroupWelcome';

const WelcomeChatItem = memo(() => {
  const isGroupSession = useSessionStore(sessionSelectors.isCurrentSessionGroupSession);

  if (isGroupSession) return <GroupWelcome />;

  return <AgentWelcome />;
});

export default WelcomeChatItem;
