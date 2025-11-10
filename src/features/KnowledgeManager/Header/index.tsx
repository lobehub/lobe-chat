'use client';

import { ChatHeader } from '@lobehub/ui/chat';
import { memo } from 'react';

import AddButton from './AddButton';
import FilesSearchBar from './FilesSearchBar';

const Header = memo<{ knowledgeBaseId?: string }>(({ knowledgeBaseId }) => {
  return (
    <ChatHeader
      left={<FilesSearchBar />}
      right={<AddButton knowledgeBaseId={knowledgeBaseId} />}
      styles={{
        left: { padding: 0 },
      }}
    />
  );
});

export default Header;
