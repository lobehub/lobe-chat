import isEqual from 'fast-deep-equal';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { PropsWithChildren, memo, useEffect } from 'react';
import { Flexbox } from 'react-layout-kit';

import { sessionSelectors, useSessionStore } from '@/store/session';
import { useSettings } from '@/store/settings';

import Sidebar from '../Sidebar';
import { Sessions } from './SessionList';

const ChatLayout = memo<PropsWithChildren>(({ children }) => {
  const [title] = useSessionStore((s) => {
    const context = sessionSelectors.currentSession(s);
    return [context?.meta.title];
  }, isEqual);

  useEffect(() => {
    useSettings.persist.rehydrate();
    useSettings.setState({ sidebarKey: 'chat' });
  }, []);

  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (typeof id === 'string') {
      useSessionStore.setState({ activeId: id });
    }
  }, [id]);

  return (
    <>
      <Head>
        <title>{title ? `${title} - LobeChat` : 'LobeChat'}</title>
      </Head>
      <Flexbox horizontal width={'100%'}>
        <Sidebar />
        <Sessions />
        {children}
      </Flexbox>
    </>
  );
});

export default ChatLayout;
