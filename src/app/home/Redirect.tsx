'use client';

import { useRouter } from 'next/navigation';
import { memo, useEffect } from 'react';

import { messageService } from '@/services/message';
import { sessionService } from '@/services/session';
import { useSessionStore } from '@/store/session';

/**
 * 检查当前是否存在历史会话
 *
 * 这个决定了首次打开页面时是跳转到欢迎页面还是聊天页面
 */
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
      if (hasData) {
        router.push('/chat');

        switchSession();
      } else {
        router.push('/welcome');
      }
    });
  }, []);

  return null;
});

export default Redirect;
