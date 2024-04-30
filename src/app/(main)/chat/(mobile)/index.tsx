'use client';

import { useRouter } from 'next/navigation';
import { memo, useEffect } from 'react';

import MobileContentLayout from '@/components/server/MobileNavLayout';

import SessionHeader from './features/SessionHeader';
import SessionList from './features/SessionList';

const ChatMobilePage = memo(() => {
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/chat/mobile');
    router.prefetch('/settings');
  }, []);

  return (
    <MobileContentLayout header={<SessionHeader />} withNav>
      <SessionList />
    </MobileContentLayout>
  );
});

export default ChatMobilePage;
