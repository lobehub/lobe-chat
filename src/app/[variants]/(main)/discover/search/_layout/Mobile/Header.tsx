'use client';

import { ChatHeader } from '@lobehub/ui/mobile';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import urlJoin from 'url-join';

import { useDiscoverTab } from '@/hooks/useDiscoverTab';
import { mobileHeaderSticky } from '@/styles/mobileHeader';

import StoreSearchBar from '../../../features/StoreSearchBar';

const Header = memo(() => {
  const router = useRouter();
  const type = useDiscoverTab();

  return (
    <ChatHeader
      onBackClick={() => router.push(urlJoin('/discover', type as string))}
      right={<StoreSearchBar autoFocus={false} mobile style={{ width: '100%' }} />}
      showBackButton
      style={{
        ...mobileHeaderSticky,
        overflow: 'unset',
      }}
      styles={{ center: { display: 'none' }, left: { flex: 'none' } }}
    />
  );
});

export default Header;
