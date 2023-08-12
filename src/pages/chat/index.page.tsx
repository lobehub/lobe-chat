import Head from 'next/head';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { INBOX_SESSION_ID } from '@/const/session';
import { useOnFinishHydrationSession, useSessionStore } from '@/store/session';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import Conversation from './features/Conversation';
import Header from './features/Header';
import SideBar from './features/Sidebar';
import Layout from './layout';

const Chat = memo(() => {
  const { t } = useTranslation('common');

  const pageTitle = genSiteHeadTitle(t('inbox.title'));

  useOnFinishHydrationSession(() => {
    useSessionStore.getState().activeSession(INBOX_SESSION_ID);
  });

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Layout>
        <Header settings={false} />
        <Flexbox flex={1} height={'calc(100vh - 64px)'} horizontal>
          <Conversation />
          <SideBar systemRole={false} />
        </Flexbox>
      </Layout>
    </>
  );
});
export default Chat;
