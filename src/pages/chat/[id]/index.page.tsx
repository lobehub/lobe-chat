import Head from 'next/head';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { agentSelectors, useSessionStore } from '@/store/session';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import Conversation from '../features/Conversation';
import Header from '../features/Header';
import SideBar from '../features/Sidebar';
import Layout from './layout';

const Chat = memo(() => {
  const [avatar, title] = useSessionStore((s) => [
    agentSelectors.currentAgentAvatar(s),
    agentSelectors.currentAgentTitle(s),
  ]);

  const pageTitle = genSiteHeadTitle([avatar, title].filter(Boolean).join(' '));

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Layout>
        <Header />
        <Flexbox flex={1} height={'calc(100vh - 64px)'} horizontal>
          <Conversation />
          <SideBar />
        </Flexbox>
      </Layout>
    </>
  );
});
export default Chat;
