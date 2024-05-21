'use client';

import { useRouter } from 'next/navigation';
import { memo, useEffect } from 'react';

import { messageService } from '@/services/message';
import { sessionService } from '@/services/session';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

const checkHasConversation = async () => {
  const hasMessages = await messageService.hasMessages();
  const hasAgents = await sessionService.hasSessions();
  return hasMessages || hasAgents;
};

const Redirect = memo(() => {
  const router = useRouter();
  const isLogin = useUserStore(authSelectors.isLogin);

  useEffect(() => {
    if (!isLogin) {
      router.replace('/welcome');
      return;
    }

    checkHasConversation().then((hasData) => {
      if (hasData) {
        router.replace('/chat');
      } else {
        router.replace('/welcome');
      }
    });
  }, []);

  return null;
});

export default Redirect;
