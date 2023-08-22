import { useRouter } from 'next/router';
import { PropsWithChildren, memo } from 'react';
import { shallow } from 'zustand/shallow';

import { usePluginStore } from '@/store/plugin';
import { useOnFinishHydrationSession, useSessionStore } from '@/store/session';

import ChatLayout from '../layout';

const Layout = memo<PropsWithChildren>(({ children }) => {
  const useFetchPluginList = usePluginStore((s) => s.useFetchPluginList);
  const [activeSession, toggleTopic] = useSessionStore((s) => {
    return [s.activeSession, s.toggleTopic];
  }, shallow);

  const router = useRouter();
  const { id } = router.query;

  useOnFinishHydrationSession(() => {
    // 1. 正常激活会话
    if (typeof id === 'string') {
      activeSession(id);
    }

    // 将话题重置为默认值
    toggleTopic();
  }, [id]);

  useFetchPluginList();

  return <ChatLayout>{children}</ChatLayout>;
});

export default Layout;
