import { Accordion, ScrollShadow } from '@lobehub/ui';
import { Suspense, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { NavPanelPortal } from '@/features/NavPanel';

import ConfigSwitcher from './ConfigSwitcher';
import Header from './Header';
import Topic from './Topic';

export enum ChatSidebarKey {
  Topic = 'topic',
}

const ChatTopic = memo(() => {
  return (
    <NavPanelPortal navKey="chat">
      <Suspense>
        <Header />
        <ConfigSwitcher />
        <ScrollShadow size={2} style={{ flex: 1 }}>
          <Flexbox paddingInline={8}>
            <Accordion defaultExpandedKeys={[ChatSidebarKey.Topic]} disableAnimation gap={8}>
              <Topic itemKey={ChatSidebarKey.Topic} />
            </Accordion>
          </Flexbox>
        </ScrollShadow>
      </Suspense>
    </NavPanelPortal>
  );
});

ChatTopic.displayName = 'ChatTopic';

export default ChatTopic;
