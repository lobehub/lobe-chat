import isEqual from 'fast-deep-equal';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { memo, useEffect } from 'react';
import { Flexbox } from 'react-layout-kit';

import { sessionSelectors, useChatStore } from '@/store/session';
import { useSettings } from '@/store/settings';

import Sidebar from '../../Sidebar';
import Config from '../Config';
import Conversation from '../Conversation';
import Header from '../Header';
import { Sessions } from '../SessionList';

const ChatLayout = memo(() => {
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
      <Flexbox horizontal width={'100%'}>
        <Sidebar />
        <Sessions />
        <Flexbox flex={1}>
          <Header />
          <Flexbox
            id={'lobe-conversion-container'}
            style={{ height: 'calc(100vh - 64px)', position: 'relative' }}
          >
            <Conversation />
            <Config />
          </Flexbox>
        </Flexbox>
      </Flexbox>
    </>
  );
});

export const getServerSideProps = async (context: any) => ({
  props: await serverSideTranslations(context.locale),
});
export default ChatLayout;
