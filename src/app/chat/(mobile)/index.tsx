'use client';

import { useRouter } from 'next/navigation';
import { memo, useEffect } from 'react';

import PageTitle from '../features/PageTitle';
import SessionList from './features/SessionList';

const ChatMobilePage = memo(() => {
  const router = useRouter();
  useEffect(() => {
    router.prefetch('/chat/mobile');
    router.prefetch('/settings');
  }, []);

  return (
    <>
      <PageTitle />
      <SessionList />
    </>
  );
});

export default ChatMobilePage;
