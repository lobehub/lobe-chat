import React, { Suspense, memo } from 'react';

import { NavPanelPortal } from '@/features/NavPanel';
import SideBarLayout from '@/features/NavPanel/SideBarLayout';

import Body from './Body';
import Header from './Header';

const ChatTopic = memo(() => {
  return (
    <NavPanelPortal navKey="agent">
      <Suspense>
        <SideBarLayout body={<Body />} header={<Header />} />
      </Suspense>
    </NavPanelPortal>
  );
});

ChatTopic.displayName = 'ChatTopic';

export default ChatTopic;
