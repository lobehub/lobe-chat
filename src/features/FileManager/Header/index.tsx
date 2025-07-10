'use client';

import { ChatHeader } from '@lobehub/ui/chat';
import { memo } from 'react';

import FilesSearchBar from './FilesSearchBar';
import TogglePanelButton from './TogglePanelButton';
import UploadFileButton from './UploadFileButton';

const Header = memo<{ knowledgeBaseId?: string }>(({ knowledgeBaseId }) => {
  return (
    <ChatHeader
      left={
        <>
          <TogglePanelButton />
          <FilesSearchBar />
        </>
      }
      right={<UploadFileButton knowledgeBaseId={knowledgeBaseId} />}
      styles={{
        left: { padding: 0 },
      }}
    />
  );
});

export default Header;
