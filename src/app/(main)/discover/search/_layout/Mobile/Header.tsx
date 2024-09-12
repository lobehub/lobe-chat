'use client';

import { MobileNavBar } from '@lobehub/ui';
import { usePathname, useRouter } from 'next/navigation';
import { memo } from 'react';
import urlJoin from 'url-join';

import { mobileHeaderSticky } from '@/styles/mobileHeader';

import StoreSearchBar from '../../../features/StoreSearchBar';

const Header = memo(() => {
  const pathname = usePathname();
  const router = useRouter();

  const path = pathname.split('/').filter(Boolean)[1];

  return (
    <MobileNavBar
      contentStyles={{ center: { display: 'none' }, left: { flex: 'none' } }}
      onBackClick={() => router.push(urlJoin('/discover', path))}
      right={<StoreSearchBar autoFocus={false} mobile style={{ width: '100%' }} />}
      showBackButton
      style={{
        ...mobileHeaderSticky,
        overflow: 'unset',
      }}
    />
  );
});

export default Header;
