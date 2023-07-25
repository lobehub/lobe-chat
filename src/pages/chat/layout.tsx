import { useRouter } from 'next/router';
import { PropsWithChildren, memo, useEffect } from 'react';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import SideBar from '@/features/SideBar';
import { createI18nNext } from '@/locales/create';
import { useSessionStore } from '@/store/session';
import { useSettings } from '@/store/settings';

import { Sessions } from './SessionList';

const initI18n = createI18nNext();

const ChatLayout = memo<PropsWithChildren>(({ children }) => {
  useEffect(() => {
    initI18n.finally();
  }, []);

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
    const hasRehydrated = useSettings.persist.hasHydrated();
    if (hasRehydrated) {
      useSettings.setState({ sidebarKey: 'chat' });
    }
  }, []);

  return (
    <Flexbox horizontal width={'100%'}>
      <SideBar />
      <Sessions />
      <Flexbox flex={1} height={'100vh'} style={{ position: 'relative' }}>
        {children}
      </Flexbox>
    </Flexbox>
  );
});

export default ChatLayout;
