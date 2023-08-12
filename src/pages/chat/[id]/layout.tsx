import { useRouter } from 'next/router';
import { PropsWithChildren, memo, useEffect } from 'react';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import AppLayout from '@/layout/AppLayout';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';

import { Sessions } from '../SessionList';

const ChatLayout = memo<PropsWithChildren>(({ children }) => {
  const [activeSession, toggleTopic] = useSessionStore((s) => {
    return [s.activeSession, s.toggleTopic];
  }, shallow);

  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const hasRehydrated = useSessionStore.persist.hasHydrated();
    // 只有当水合完毕后再开始做操作
    if (!hasRehydrated) return;

    // 1. 正常激活会话
    if (typeof id === 'string') {
      activeSession(id);
    }

    // 将话题重置为默认值
    toggleTopic();
  }, [id]);

  useEffect(() => {
    const hasRehydrated = useGlobalStore.persist.hasHydrated();
    if (hasRehydrated) {
      useGlobalStore.setState({ sidebarKey: 'chat' });
    }
  }, []);

  return (
    <AppLayout>
      <Sessions />
      <Flexbox flex={1} height={'100vh'} style={{ position: 'relative' }}>
        {children}
      </Flexbox>
    </AppLayout>
  );
});

export default ChatLayout;
