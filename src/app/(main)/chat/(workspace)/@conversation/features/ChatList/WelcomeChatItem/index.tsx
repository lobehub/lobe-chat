import React, { memo } from 'react';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import InboxWelcome from './InboxWelcome';
import WelcomeMessage from './WelcomeMessage';

const WelcomeChatItem = memo(() => {
  const [showInboxWelcome, isCurrentChatLoaded] = useChatStore((s) => [
    chatSelectors.showInboxWelcome(s),
    chatSelectors.isCurrentChatLoaded(s),
  ]);

  if (showInboxWelcome && isCurrentChatLoaded) return <InboxWelcome />;

  return <WelcomeMessage />;
});

export default WelcomeChatItem;
