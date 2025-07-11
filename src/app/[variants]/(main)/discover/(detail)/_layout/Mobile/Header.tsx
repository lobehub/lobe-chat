'use client';

import { ChatHeader } from '@lobehub/ui/mobile';
import { usePathname } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { memo } from 'react';
import urlJoin from 'url-join';

import { mobileHeaderSticky } from '@/styles/mobileHeader';

const Header = memo(() => {
  const pathname = usePathname();
  const router = useRouter();

  const path = pathname.split('/').filter(Boolean)[1];

  return (
    <ChatHeader
      onBackClick={() => router.push(urlJoin('/discover', path))}
      showBackButton
      style={mobileHeaderSticky}
    />
  );
});

export default Header;
