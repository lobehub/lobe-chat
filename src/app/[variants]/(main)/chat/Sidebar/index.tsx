import { Accordion } from '@lobehub/ui';
import React, { Suspense, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { NavPanelPortal } from '@/features/NavPanel';
import SessionHydration from '@/features/NavPanel/SessionHydration';
import SideBarLayout from '@/features/NavPanel/SideBarLayout';

import Header from './Header';
import Topic from './Topic';

export enum ChatSidebarKey {
  Topic = 'topic',
}

const ChatTopic = memo(() => {
  return (
    <NavPanelPortal navKey="chat">
      <Suspense>
        <SideBarLayout
          body={
            <Flexbox paddingInline={8}>
              <Accordion defaultExpandedKeys={[ChatSidebarKey.Topic]} disableAnimation gap={8}>
                <Topic itemKey={ChatSidebarKey.Topic} />
              </Accordion>
            </Flexbox>
          }
          header={<Header />}
        />
        <SessionHydration />
      </Suspense>
    </NavPanelPortal>
  );
});

ChatTopic.displayName = 'ChatTopic';

export default ChatTopic;
