import React, { memo } from 'react';

import { sessionSelectors } from '@/store/session/selectors';
import { useSessionStore } from '@/store/session/store';

import GroupWelcome from './GroupWelcome';
import WelcomeMessage from './WelcomeMessage';

const WelcomeChatItem = memo(() => {
  const isGroupSession = useSessionStore(sessionSelectors.isCurrentSessionGroupSession);

  if (isGroupSession) return <GroupWelcome />;

  return <WelcomeMessage />;
});

export default WelcomeChatItem;
