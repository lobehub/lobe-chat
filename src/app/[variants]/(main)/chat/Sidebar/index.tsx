import { Suspense, memo } from 'react';

import { NavPanelPortal } from '@/features/NavPanel';

import ConfigSwitcher from './ConfigSwitcher';
import Header from './Header';
import Topic from './Topic';

const ChatTopic = memo(() => {
  return (
    <NavPanelPortal navKey="chat">
      <Suspense>
        <Header />
        <ConfigSwitcher />
        <Topic />
      </Suspense>
    </NavPanelPortal>
  );
});

ChatTopic.displayName = 'ChatTopic';

export default ChatTopic;
