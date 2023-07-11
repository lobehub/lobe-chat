import isEqual from 'fast-deep-equal';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { memo, useEffect } from 'react';
import { Flexbox } from 'react-layout-kit';

import { sessionSelectors, useChatStore } from '@/store/session';
import { useSettings } from '@/store/settings';

import Config from './Config';
import Conversation from './Conversation';
import Header from './Header';
import { Sessions } from './SessionList';
import Sidebar from './Sidebar';

const ChatLayout = () => {
  const [title] = useChatStore((s) => {
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
      useChatStore.setState({ activeId: id });
    }
  }, [id]);

  return (
    <>
      <Head>
        <title>{title ? `${title} - LobeChat` : 'LobeChat'}</title>
      </Head>
      <Flexbox width={'100%'} horizontal>
        <Sidebar />
        <Sessions />
        <Flexbox flex={1}>
          <Header />
          <Flexbox id={'lobe-conversion-container'} style={{ position: 'relative', height: 'calc(100vh - 64px)' }}>
            <Conversation />
            <Config />
          </Flexbox>
        </Flexbox>
      </Flexbox>
    </>
  );
};

export default memo(ChatLayout);
