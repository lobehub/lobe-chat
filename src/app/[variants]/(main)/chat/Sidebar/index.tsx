import { Suspense, memo } from 'react';

import { NavPanelPortal } from '@/features/NavPanel';
import BackButton from '@/features/NavPanel/BackButton';

import ConfigSwitcher from './ConfigSwitcher';
import Topic from './Topic';

const ChatTopic = memo(() => {
  return (
    <NavPanelPortal navKey="chat">
      <BackButton />
      <Suspense>
        <ConfigSwitcher />
        <Topic />
      </Suspense>
    </NavPanelPortal>
  );
});

ChatTopic.displayName = 'ChatTopic';

export default ChatTopic;
