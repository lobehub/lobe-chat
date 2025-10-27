'use client';

import { ChatHeader } from '@lobehub/ui/chat';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import FilesSearchBar from './FilesSearchBar';
import NewNoteButton from './NewNoteButton';
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
      right={
        <Flexbox gap={8} horizontal>
          <NewNoteButton knowledgeBaseId={knowledgeBaseId} />
          <UploadFileButton knowledgeBaseId={knowledgeBaseId} />
        </Flexbox>
      }
      styles={{
        left: { padding: 0 },
      }}
    />
  );
});

export default Header;
