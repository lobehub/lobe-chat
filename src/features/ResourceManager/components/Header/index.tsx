'use client';

import { ChatHeader } from '@lobehub/ui/chat';
import { memo } from 'react';

import AddButton from './AddButton';
import FilesSearchBar from './FilesSearchBar';

const Header = memo<{ knowledgeBaseId?: string }>(() => {
  return (
    <ChatHeader
      left={<FilesSearchBar />}
      right={<AddButton />}
      styles={{
        left: { padding: 0 },
      }}
    />
  );
});

export default Header;
