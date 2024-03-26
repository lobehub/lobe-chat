'use client';

import { useRouter } from 'next/navigation';
import { memo, useEffect } from 'react';

import SessionHeader from './features/SessionHeader';
import SessionList from './features/SessionList';

const ChatMobilePage = memo(() => {
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/chat/mobile');
    router.prefetch('/settings');
  }, []);

  return (
    <>
      <SessionHeader />
      <SessionList />
    </>
  );
});

export default ChatMobilePage;
