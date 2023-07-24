import Router from 'next/router';
import { useEffect } from 'react';

import { sessionSelectors, useSessionStore } from '@/store/session';

import Chat from './[id]/index.page';

export default () => {
  // 支持用户在进到首页时，自动激活第一个列表中的角色
  useEffect(() => {
    const hasRehydrated = useSessionStore.persist.hasHydrated();
    // 只有当水合完毕后，才往下走
    if (!hasRehydrated) return;

    // 如果当前有会话，那么就激活第一个会话
    const list = sessionSelectors.chatList(useSessionStore.getState());
    if (list.length > 0) {
      const sessionId = list[0].id;
      Router.push(`/chat/${sessionId}`);
    }
  }, []);

  return <Chat />;
};
