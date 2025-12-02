'use client';

import { ChatHeader } from '@lobehub/ui/chat';
import { memo } from 'react';

import { isCustomBranding } from '@/const/version';

import CreateButton from '../../features/CreateButton';
import StoreSearchBar from '../../features/Search';

const Header = memo(() => {
  return (
    <ChatHeader
      right={!isCustomBranding && <CreateButton />}
      style={{
        position: 'relative',
        zIndex: 10,
      }}
      styles={{
        center: { flex: 1, maxWidth: 1440 },
        left: { flex: 1, maxWidth: 240 },
        right: { flex: 1, maxWidth: 240 },
      }}
    >
      <StoreSearchBar />
    </ChatHeader>
  );
});

export default Header;
