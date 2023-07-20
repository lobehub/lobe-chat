import { DraggablePanelBody } from '@lobehub/ui';
import { memo } from 'react';

import FolderPanel from '@/features/FolderPanel';

import Header from './Header';
import SessionList from './List';

export const Sessions = memo(() => {
  return (
    <FolderPanel>
      <Header />
      <DraggablePanelBody style={{ padding: 0 }}>
        <SessionList />
      </DraggablePanelBody>
    </FolderPanel>
  );
});
