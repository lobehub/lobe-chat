'use client';

import { useRouter } from 'next/navigation';
import { memo, useEffect } from 'react';

import { messageService } from '@/services/message';
import { sessionService } from '@/services/session';
import { useGlobalStore } from '@/store/global';
import { SidebarTabKey } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';

const checkHasConversation = async () => {
  const hasMessages = await messageService.hasMessages();
  const hasAgents = await sessionService.hasSessions();
  return hasMessages || hasAgents;
};

const Redirect = memo(() => {
  const router = useRouter();
  const [switchSession] = useSessionStore((s) => [s.switchSession]);

  useEffect(() => {
    checkHasConversation().then((hasData) => {
      useGlobalStore.getState().switchSideBar(SidebarTabKey.Chat);

      if (hasData) {
        router.replace('/chat');

        switchSession();
      } else {
        router.replace('/welcome');
      }
    });
  }, []);

  return null;
});

export default Redirect;
