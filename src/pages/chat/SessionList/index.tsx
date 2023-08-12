import { DraggablePanelBody } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import FolderPanel from '@/features/FolderPanel';

import Header from './Header';
import Inbox from './Inbox';
import SessionList from './List';

export const Sessions = memo(() => {
  return (
    <FolderPanel>
      <Header />
      <DraggablePanelBody style={{ padding: 0 }}>
        <Flexbox gap={8}>
          <Inbox />
          <Flexbox paddingInline={16} style={{ fontSize: 12 }}>
            角色列表
          </Flexbox>
          <SessionList />
        </Flexbox>
      </DraggablePanelBody>
    </FolderPanel>
  );
});
