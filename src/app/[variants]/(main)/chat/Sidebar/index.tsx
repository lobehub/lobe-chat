import { Suspense, memo } from 'react';

import { NavPanelPortal } from '@/features/NavPanel';
import SessionHydration from '@/features/NavPanel/SessionHydration';

import ConfigSwitcher from './ConfigSwitcher';
import Header from './Header';
import Topic from './Topic';

const ChatTopic = memo(() => {
  return (
    <>
      <NavPanelPortal navKey="chat">
        <Suspense>
          <Header />
          <ConfigSwitcher />
          <Topic />
        </Suspense>
      </NavPanelPortal>
      <SessionHydration />
    </>
  );
});

ChatTopic.displayName = 'ChatTopic';

export default ChatTopic;
