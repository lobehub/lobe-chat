import isEqual from 'fast-deep-equal';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { memo, useEffect } from 'react';
import { Flexbox } from 'react-layout-kit';

import { sessionSelectors, useChatStore } from '@/store/session';
import { useSettings } from '@/store/settings';

import Conversation from './Conversation';
import Header from './Header';
import { Sessions } from './SessionList';
import Sidebar from './Sidebar';

const ChatLayout = () => {
  const [title] = useChatStore((s) => {
    const context = sessionSelectors.currentChat(s);
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
      <Flexbox horizontal width={'100%'}>
        <Sidebar />
        <Sessions />
        <Flexbox flex={1}>
          <Header />
          <Flexbox style={{ height: 'calc(100vh - 64px)', position: 'relative' }}>
            <Conversation />
          </Flexbox>
        </Flexbox>
      </Flexbox>
    </>
  );
};

export default memo(ChatLayout);
