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

  const [activeSession] = useSessionStore((s) => {
    return [s.activeSession];
  }, shallow);

  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const hasRehydrated = useSessionStore.persist.hasHydrated();
    // 只有当水合完毕后，才能正常去激活会话
    if (typeof id === 'string' && hasRehydrated) {
      activeSession(id);
    }
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
      <Flexbox flex={1}>{children}</Flexbox>
    </Flexbox>
  );
});

export default ChatLayout;
