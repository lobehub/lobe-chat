'use client';

import { ChatHeader } from '@lobehub/ui/chat';
import { memo } from 'react';

import AddButton from './AddButton';
import FilesSearchBar from './FilesSearchBar';
import TogglePanelButton from './TogglePanelButton';

const Header = memo<{ knowledgeBaseId?: string }>(({ knowledgeBaseId }) => {
  return (
    <ChatHeader
      left={
        <>
          <TogglePanelButton />
          <FilesSearchBar />
        </>
      }
      right={<AddButton knowledgeBaseId={knowledgeBaseId} />}
      styles={{
        left: { padding: 0 },
      }}
    />
  );
});

export default Header;
