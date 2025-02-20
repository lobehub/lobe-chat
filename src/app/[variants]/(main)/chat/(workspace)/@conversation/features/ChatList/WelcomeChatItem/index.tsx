import React, { memo } from 'react';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import InboxWelcome from './InboxWelcome';
import WelcomeMessage from './WelcomeMessage';

const WelcomeChatItem = memo(() => {
  const showInboxWelcome = useChatStore(chatSelectors.showInboxWelcome);

  if (showInboxWelcome) return <InboxWelcome />;

  return <WelcomeMessage />;
});

export default WelcomeChatItem;
